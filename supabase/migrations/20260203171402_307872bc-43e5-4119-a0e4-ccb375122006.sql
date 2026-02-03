-- Create table for tool notification subscriptions
CREATE TABLE public.tool_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (email, tool_id)
);

-- Enable Row Level Security
ALTER TABLE public.tool_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can subscribe to tool notifications" 
ON public.tool_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own subscriptions by email (for checking if already subscribed)
CREATE POLICY "Anyone can check subscription status" 
ON public.tool_subscriptions 
FOR SELECT 
USING (true);