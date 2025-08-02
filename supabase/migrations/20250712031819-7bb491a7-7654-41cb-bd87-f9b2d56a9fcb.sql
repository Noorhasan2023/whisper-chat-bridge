-- Allow messages to be updated for translations
CREATE POLICY "Anyone can update messages for translations" 
ON public.messages 
FOR UPDATE 
USING (true);