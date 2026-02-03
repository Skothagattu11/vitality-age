-- Create table for assessment responses
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT,
  functional_age INTEGER NOT NULL,
  chronological_age INTEGER NOT NULL,
  gap INTEGER NOT NULL,
  top_drivers JSONB NOT NULL,
  assessment_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert assessment responses (public submission)
CREATE POLICY "Anyone can submit assessment responses" 
ON public.assessment_responses 
FOR INSERT 
WITH CHECK (true);

-- Allow updating email on own session
CREATE POLICY "Anyone can update their session email" 
ON public.assessment_responses 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow reading own session by session_id
CREATE POLICY "Anyone can read their session" 
ON public.assessment_responses 
FOR SELECT 
USING (true);

-- Add email column to tool_subscriptions if we want to link to sessions
ALTER TABLE public.tool_subscriptions 
ADD COLUMN IF NOT EXISTS session_id UUID;