-- Migration 002: Create daily_metrics table
-- Stores manually logged daily recovery inputs

CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours NUMERIC(4,2) NOT NULL CHECK (sleep_hours >= 0.0 AND sleep_hours <= 24.0),
  sleep_score NUMERIC(4,1) NULL CHECK (sleep_score IS NULL OR (sleep_score >= 0.0 AND sleep_score <= 100.0)),
  hrv NUMERIC(5,1) NOT NULL CHECK (hrv > 0.0 AND hrv <= 300.0),
  resting_hr NUMERIC(4,1) NOT NULL CHECK (resting_hr >= 30.0 AND resting_hr <= 220.0),
  activity_load TEXT NOT NULL CHECK (activity_load IN ('low', 'moderate', 'high')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_daily_metrics_user_date UNIQUE (user_id, date)
);

-- Index for fast 7-day to 14-day history queries and baseline calculation
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date
  ON public.daily_metrics (user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Daily Metrics Policies
CREATE POLICY "Users can view own daily metrics"
  ON public.daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily metrics"
  ON public.daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily metrics"
  ON public.daily_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily metrics"
  ON public.daily_metrics FOR DELETE
  USING (auth.uid() = user_id);
