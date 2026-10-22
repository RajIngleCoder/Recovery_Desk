-- ========================================================================
-- RECOVERY DESK — COMPLETE DATABASE INITIALIZATION MIGRATION
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1. Table: profiles
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  goal TEXT CHECK (goal IS NULL OR goal IN ('general', 'training', 'fitness')),
  sleep_target_hours NUMERIC(4,2) NOT NULL DEFAULT 8.0 CHECK (sleep_target_hours >= 4.0 AND sleep_target_hours <= 16.0),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------
-- 2. Table: daily_metrics
-- ------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date
  ON public.daily_metrics (user_id, date DESC);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily metrics" ON public.daily_metrics;
CREATE POLICY "Users can view own daily metrics"
  ON public.daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily metrics" ON public.daily_metrics;
CREATE POLICY "Users can insert own daily metrics"
  ON public.daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily metrics" ON public.daily_metrics;
CREATE POLICY "Users can update own daily metrics"
  ON public.daily_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily metrics" ON public.daily_metrics;
CREATE POLICY "Users can delete own daily metrics"
  ON public.daily_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------
-- 3. Table: recommendations
-- ------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_recommendations_user_date
  ON public.recommendations (user_id, date DESC);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.recommendations;
CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON public.recommendations;
CREATE POLICY "Users can update own recommendations"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recommendations" ON public.recommendations;
CREATE POLICY "Users can delete own recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------
-- 4. Triggers & Automated Timestamp Maintenance
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, onboarding_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_daily_metrics_updated_at ON public.daily_metrics;
CREATE TRIGGER set_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ------------------------------------------------------------------------
-- 5. Secure Account Deletion Function
-- ------------------------------------------------------------------------
-- ========================================================================
-- Secure User Account Deletion Function
-- Allows an authenticated user to permanently delete their own account
-- from auth.users, cascading to profiles, daily_metrics, and recommendations.
-- ========================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID from the JWT
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- Foreign key ON DELETE CASCADE automatically cleans up:
  -- • public.profiles
  -- • public.daily_metrics
  -- • public.recommendations
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execution permission strictly to authenticated users
REVOKE ALL ON FUNCTION public.delete_user_account() FROM public;
REVOKE ALL ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
