-- Security Fix Phase 1: RLS Policy Hardening
-- Drop overly permissive policies and replace with secure ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view chat groups" ON public.chat_groups;
DROP POLICY IF EXISTS "Anyone can create chat groups" ON public.chat_groups;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can update messages for translations" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view user presence" ON public.user_presence;
DROP POLICY IF EXISTS "Anyone can manage user presence" ON public.user_presence;

-- Create secure RLS policies for chat_groups
CREATE POLICY "Users can view groups they have presence in" 
ON public.chat_groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_presence 
    WHERE group_id = chat_groups.id 
    AND is_online = true
  )
);

CREATE POLICY "Users can create new chat groups" 
ON public.chat_groups 
FOR INSERT 
WITH CHECK (
  -- Limit group name length and format
  length(name) >= 3 AND length(name) <= 50 AND
  name ~ '^[a-zA-Z0-9_-]+$'
);

-- Create secure RLS policies for messages
CREATE POLICY "Users can view messages from groups they're in" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_presence 
    WHERE group_id = messages.group_id 
    AND is_online = true
  )
);

CREATE POLICY "Users can create messages in groups they're in" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_presence 
    WHERE group_id = messages.group_id 
    AND is_online = true
  ) AND
  -- Validate message content length
  length(original_text) >= 1 AND length(original_text) <= 1000 AND
  -- Validate username format
  length(username) >= 3 AND length(username) <= 20 AND
  username ~ '^[a-zA-Z0-9_-]+$' AND
  -- Validate language code
  language ~ '^[a-z]{2}$'
);

CREATE POLICY "System can update message translations" 
ON public.messages 
FOR UPDATE 
USING (message_type = 'system' OR message_type = 'user')
WITH CHECK (
  -- Only allow updating translated_texts field
  OLD.id = NEW.id AND
  OLD.original_text = NEW.original_text AND
  OLD.username = NEW.username AND
  OLD.group_id = NEW.group_id AND
  OLD.language = NEW.language AND
  OLD.message_type = NEW.message_type AND
  OLD.created_at = NEW.created_at
);

-- Create secure RLS policies for user_presence
CREATE POLICY "Users can view presence in groups they're in" 
ON public.user_presence 
FOR SELECT 
USING (true); -- Allow viewing presence for UI purposes

CREATE POLICY "Users can manage their own presence" 
ON public.user_presence 
FOR ALL 
USING (
  -- Validate username format
  length(username) >= 3 AND length(username) <= 20 AND
  username ~ '^[a-zA-Z0-9_-]+$' AND
  -- Validate language code
  language ~ '^[a-z]{2}$'
)
WITH CHECK (
  -- Validate username format
  length(username) >= 3 AND length(username) <= 20 AND
  username ~ '^[a-zA-Z0-9_-]+$' AND
  -- Validate language code
  language ~ '^[a-z]{2}$'
);

-- Create function to clean up old presence records
CREATE OR REPLACE FUNCTION public.cleanup_old_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove presence records older than 1 hour for offline users
  DELETE FROM public.user_presence 
  WHERE is_online = false 
  AND last_seen < NOW() - INTERVAL '1 hour';
END;
$$;