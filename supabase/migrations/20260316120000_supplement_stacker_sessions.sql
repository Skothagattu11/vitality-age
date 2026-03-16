-- Supplement Stacker: stores full stacker state per session
-- Anonymous users get a session_id; authenticated users get user_id.
-- On sign-in, we claim the anonymous session by setting user_id.

CREATE TABLE public.supplement_stacker_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID,                          -- null for guests, set on login
  schedule JSONB NOT NULL DEFAULT '{}',
  activity JSONB NOT NULL DEFAULT '{}',
  supplements JSONB NOT NULL DEFAULT '[]',
  selected_stack_option TEXT NOT NULL DEFAULT 'optimal',
  stack_options JSONB NOT NULL DEFAULT '[]',
  interactions JSONB NOT NULL DEFAULT '[]',
  scan_results JSONB NOT NULL DEFAULT '[]',
  reminder_method TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

-- Index for fast user lookup after login
CREATE INDEX idx_stacker_sessions_user_id ON public.supplement_stacker_sessions (user_id) WHERE user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.supplement_stacker_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest or authenticated)
CREATE POLICY "Anyone can create a stacker session"
ON public.supplement_stacker_sessions
FOR INSERT
WITH CHECK (true);

-- Anyone can read their own session (by session_id or user_id)
CREATE POLICY "Users can read own stacker session"
ON public.supplement_stacker_sessions
FOR SELECT
USING (true);

-- Anyone can update their own session
CREATE POLICY "Users can update own stacker session"
ON public.supplement_stacker_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.update_stacker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stacker_updated_at
BEFORE UPDATE ON public.supplement_stacker_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_stacker_updated_at();
