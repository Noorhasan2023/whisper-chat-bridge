import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  username: string;
  original_text: string;
  translated_texts: Record<string, string>;
  language: string;
  message_type: 'user' | 'system';
  created_at: string;
  group_id: string;
}

export interface UserPresence {
  id: string;
  username: string;
  language: string;
  is_online: boolean;
  last_seen: string;
}

export const useChat = (groupId: string | null, username: string, userLanguage: string, onTranslationStart?: (messageId: string) => void, onTranslationEnd?: (messageId: string) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'user' | 'system',
        translated_texts: msg.translated_texts as Record<string, string> || {}
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  }, [groupId, toast]);

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_online', true)
        .order('username');

      if (error) throw error;
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  }, [groupId]);

  // Join group
  const joinGroup = useCallback(async (groupName: string) => {
    try {
      setIsLoading(true);

      // First try to get existing group
      let { data: group, error: groupError } = await supabase
        .from('chat_groups')
        .select()
        .eq('name', groupName)
        .single();

      // If group doesn't exist, create it
      if (groupError && groupError.code === 'PGRST116') {
        const { data: newGroup, error: createError } = await supabase
          .from('chat_groups')
          .insert({ name: groupName })
          .select()
          .single();
        
        if (createError) throw createError;
        group = newGroup;
      } else if (groupError) {
        throw groupError;
      }

      // Update user presence
      await supabase
        .from('user_presence')
        .upsert({
          group_id: group.id,
          username,
          language: userLanguage,
          is_online: true,
          last_seen: new Date().toISOString(),
        }, { onConflict: 'group_id,username' });

      // Add system message
      await supabase
        .from('messages')
        .insert({
          group_id: group.id,
          username: 'System',
          original_text: `${username} joined the chat`,
          language: 'en',
          message_type: 'system',
        });

      return group.id;
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [username, userLanguage, toast]);

  // Leave group
  const leaveGroup = useCallback(async () => {
    if (!groupId) return;

    try {
      // Update user presence
      await supabase
        .from('user_presence')
        .update({ 
          is_online: false, 
          last_seen: new Date().toISOString() 
        })
        .eq('group_id', groupId)
        .eq('username', username);

      // Add system message
      await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          username: 'System',
          original_text: `${username} left the chat`,
          language: 'en',
          message_type: 'system',
        });
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  }, [groupId, username]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!groupId || !text.trim()) return;

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          username,
          original_text: text.trim(),
          language: userLanguage,
          message_type: 'user',
        })
        .select()
        .single();

      if (error) throw error;

      // Immediately add the message to local state so sender sees it
      if (message) {
        const formattedMessage: Message = {
          ...message,
          message_type: message.message_type as 'user' | 'system',
          translated_texts: message.translated_texts as Record<string, string> || {}
        };
        setMessages(prev => [...prev, formattedMessage]);
      }

      // Get all unique languages in the group
      const { data: users } = await supabase
        .from('user_presence')
        .select('language')
        .eq('group_id', groupId)
        .eq('is_online', true);

      const uniqueLanguages = [...new Set(users?.map(u => u.language) || [])];
      
      console.log('Available languages in group:', uniqueLanguages);
      console.log('Message language:', userLanguage);
      console.log('Should translate?', uniqueLanguages.length > 1);
      
      // Trigger translation if there are multiple languages
      if (uniqueLanguages.length > 1) {
        console.log('Triggering translation for message:', message.id, 'to languages:', uniqueLanguages);
        
        // Notify that translation started
        onTranslationStart?.(message.id);
        
        const { data, error } = await supabase.functions.invoke('translate-message', {
          body: { 
            messageId: message.id, 
            targetLanguages: uniqueLanguages 
          }
        });
        
        if (error) {
          console.error('Translation error:', error);
          console.error('Translation error details:', JSON.stringify(error, null, 2));
          // Notify that translation ended even on error
          onTranslationEnd?.(message.id);
        } else {
          console.log('Translation response:', data);
          // Translation end will be handled by the real-time update
        }
      } else {
        console.log('Only one language in group, skipping translation');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [groupId, username, userLanguage, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!groupId) return;

    loadMessages();
    loadOnlineUsers();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = {
              ...payload.new,
              message_type: payload.new.message_type as 'user' | 'system',
              translated_texts: payload.new.translated_texts as Record<string, string> || {}
            } as Message;
            
            // Avoid duplicate messages - only add if not already in state
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (!exists) {
                // If this is a user message from another user in different language, start translation loading
                if (newMessage.message_type === 'user' && newMessage.username !== username && newMessage.language !== userLanguage) {
                  onTranslationStart?.(newMessage.id);
                }
                return [...prev, newMessage];
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = {
              ...payload.new,
              message_type: payload.new.message_type as 'user' | 'system',
              translated_texts: payload.new.translated_texts as Record<string, string> || {}
            } as Message;
            console.log('Message updated via real-time:', updatedMessage.id, updatedMessage.translated_texts);
            
            // Check if this update includes new translations (translation completed)
            if (Object.keys(updatedMessage.translated_texts).length > 0) {
              onTranslationEnd?.(updatedMessage.id);
            }
            
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to user presence changes
    const presenceChannel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          loadOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [groupId, loadMessages, loadOnlineUsers]);

  // Update user presence periodically
  useEffect(() => {
    if (!groupId) return;

    const interval = setInterval(async () => {
      await supabase
        .from('user_presence')
        .update({ last_seen: new Date().toISOString() })
        .eq('group_id', groupId)
        .eq('username', username);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [groupId, username]);

  return {
    messages,
    onlineUsers,
    isLoading,
    joinGroup,
    leaveGroup,
    sendMessage,
  };
};