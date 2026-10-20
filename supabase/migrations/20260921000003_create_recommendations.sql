-- Migration 003: Create recommendations table
-- Stores daily calculated recovery decisions, scores, and contributing factors

CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PUSH', 'MODERATE', 'RECOVER')),
  score NUMERIC(4,1) NOT NULL CHECK (score >= 0.0 AND score <= 100.0),
  reason_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_recommendations_user_date UNIQUE (user_id, date)
);

-- Index for retrieving today's recommendation and history
CREATE INDEX IF NOT EXISTS idx_recommendations_user_date
  ON public.recommendations (user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Recommendations Policies
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);
