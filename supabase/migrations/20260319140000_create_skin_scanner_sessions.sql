-- Create skin_scanner_sessions table for Skin Scanner tool
CREATE TABLE IF NOT EXISTS public.skin_scanner_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  skin_profile JSONB NOT NULL DEFAULT '{}',
  scan_history JSONB NOT NULL DEFAULT '[]',
  am_routine JSONB NOT NULL DEFAULT '[]',
  pm_routine JSONB NOT NULL DEFAULT '[]',
  research_cache JSONB NOT NULL DEFAULT '{}',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.skin_scanner_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: users can read/write their own rows (by user_id or session_id)
CREATE POLICY "Users can manage their own skin scanner sessions"
  ON public.skin_scanner_sessions
  FOR ALL
  USING (
    auth.uid() = user_id
    OR session_id IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = user_id
    OR session_id IS NOT NULL
  );
