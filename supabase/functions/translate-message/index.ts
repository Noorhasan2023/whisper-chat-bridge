import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WatsonX Translation Function
async function translateWithWatsonX(originalText: string, sourceLang: string, targetLang: string) {
  const apiKey = "nfN8PhcfXcMMImSz3S1Ant3qFlE8siHGh0fU7M1hvCB0";
  const projectId = "dbac5dde-922d-4a67-acef-9bd3c386ddb4";

  if (!apiKey || !projectId) {
    throw new Error("Missing WatsonX API key or Project ID in environment variables.");
  }

  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}: "${originalText}"`;

  const watsonResponse = await fetch(`https://us-south.ml.cloud.ibm.com/ml/v1/text/generate?version=2025-02-11`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model_id: "ibm/granite-3-2-8b-instruct",
      input: prompt,
      parameters: { max_new_tokens: 60, temperature: 0.2 },
      project_id: projectId
    })
  });

  if (!watsonResponse.ok) {
    throw new Error(`WatsonX API Error: ${watsonResponse.status} ${await watsonResponse.text()}`);
  }

  const watsonData = await watsonResponse.json();
  return watsonData.results?.[0]?.generated_text?.trim() || "";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, targetLanguages } = await req.json();
    console.log('Translate function called with:', { messageId, targetLanguages });

    // No API key needed for Lingva Translate

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      throw new Error('Message not found');
    }

    const translations: Record<string, string> = {};

    // Function to detect if text might be romanized (using only ASCII characters)
    const isRomanized = (text: string) => {
      // Check if text contains only ASCII characters (no native script)
      return /^[a-zA-Z0-9\s\.,!?\-'"]+$/.test(text);
    };

    // Translate to each target language
    for (const targetLang of targetLanguages) {
      console.log('Processing target language:', targetLang, 'Original language:', message.language);
      
      if (targetLang === message.language) {
        console.log('Skipping translation for same language:', targetLang);
        translations[targetLang] = message.original_text;
        continue;
      }

      console.log('About to call Lingva Translate API for translation from', message.language, 'to', targetLang);
      console.log('Translating text:', message.original_text);
      
      let sourceLanguage = message.language;
      
      // Check if the text might be romanized version of target language
      // For example, if user selected Hindi but typed in English characters
      if (message.language === 'en' && isRomanized(message.original_text) && targetLang !== 'en') {
        // First try to translate from target language to see if it makes sense
        console.log('Checking if text might be romanized', targetLang);
        try {
          const testTranslation = await translateWithWatsonX(message.original_text, targetLang, message.language);
          if (testTranslation && testTranslation.trim() !== message.original_text) {
            console.log('Text appears to be romanized', targetLang, 'detected');
            sourceLanguage = targetLang;
          }
        } catch (error) {
          console.log('Error checking romanized text:', error);
        }
      }
      
      try {
        console.log(`Calling WatsonX AI translation from ${sourceLanguage} to ${targetLang}`);
        const translatedText = await translateWithWatsonX(message.original_text, sourceLanguage, targetLang);
        if (translatedText) {
          translations[targetLang] = translatedText;
          console.log(`Translation result: ${targetLang} = ${translatedText}`);
        }
      } catch (fetchError) {
        console.error('Error calling WatsonX API for', targetLang, ':', fetchError);
        continue;
      }
    }

    console.log('Final translations:', translations);

    // Update message with translations
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        translated_texts: {
          ...message.translated_texts,
          ...translations
        }
      })
      .eq('id', messageId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, translations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in translate-message function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});