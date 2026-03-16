-- Add nutrition cart and plans columns to supplement_stacker_sessions
ALTER TABLE public.supplement_stacker_sessions
  ADD COLUMN IF NOT EXISTS nutrition_cart JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS nutrition_plans JSONB NOT NULL DEFAULT '{}';
