# Recovery Desk — Database Schema & Security

## 1. Overview

Recovery Desk uses **PostgreSQL** hosted on **Supabase**. Security is enforced at the database layer via **Row Level Security (RLS)**. Every user-owned record is mapped directly to the authenticated user's ID (`auth.uid()`).

Clients use the public Supabase publishable key. Under no circumstances is the `service_role` key permitted in client applications.

---

## 2. Table Specifications

### 2.1 `profiles`
Stores user profile information, recovery goals, and onboarding completion state.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth user ID |
| `display_name` | `TEXT` | `NULL` | User's chosen display name |
| `goal` | `TEXT` | `NULL CHECK (goal IN ('general', 'training', 'fitness'))` | User's primary wellness focus |
| `sleep_target_hours` | `NUMERIC(4,2)` | `DEFAULT 8.0 CHECK (sleep_target_hours > 0 AND sleep_target_hours <= 24)` | Ideal sleep duration target in hours |
| `onboarding_completed`| `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Controls routing to main app vs. onboarding |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT NOW()` | Record last update timestamp |

---

### 2.2 `daily_metrics`
Stores manually logged daily recovery data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique entry identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Record owner |
| `date` | `DATE` | `NOT NULL` | The calendar date of the recovery metrics |
| `sleep_hours` | `NUMERIC(4,2)` | `NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24)` | Total sleep duration in decimal hours |
| `sleep_score` | `NUMERIC(4,1)` | `NULL CHECK (sleep_score >= 0 AND sleep_score <= 100)` | Optional subjective/device sleep score |
| `hrv` | `NUMERIC(5,1)` | `NOT NULL CHECK (hrv > 0 AND hrv <= 300)` | Heart Rate Variability (rMSSD in ms) |
| `resting_hr` | `NUMERIC(4,1)` | `NOT NULL CHECK (resting_hr >= 30 AND resting_hr <= 220)` | Resting heart rate in bpm |
| `activity_load` | `TEXT` | `NOT NULL CHECK (activity_load IN ('low', 'moderate', 'high'))` | Subjective load rating for yesterday |
| `notes` | `TEXT` | `NULL` | Optional personal notes (max 500 chars) |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT NOW()` | Timestamp of logging |
| `updated_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT NOW()` | Timestamp of last modification |

**Constraints & Indexes**:
- `UNIQUE (user_id, date)`: Enforces at most one entry per user per calendar day.
- `INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date DESC)`: Enables fast 7-day to 14-day history queries for baseline calculation.

---

### 2.3 `recommendations`
Caches the calculated daily recovery status, score, and factor breakdown.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique record identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Record owner |
| `date` | `DATE` | `NOT NULL` | Calendar date of recommendation |
| `status` | `TEXT` | `NOT NULL CHECK (status IN ('PUSH', 'MODERATE', 'RECOVER'))` | Primary decision |
| `score` | `NUMERIC(4,1)` | `NOT NULL CHECK (score >= 0 AND score <= 100)` | Calculated recovery composite score |
| `reason_data` | `JSONB` | `NOT NULL` | Structured payload of factors, baselines, and deviations |
| `created_at` | `TIMESTAMPTZ`| `NOT NULL DEFAULT NOW()` | Timestamp when generated |

**Constraints & Indexes**:
- `UNIQUE (user_id, date)`: Enforces one official recommendation per day.
- `INDEX idx_recommendations_user_date ON recommendations(user_id, date DESC)`: Fast retrieval for home screen and history.

---

## 3. Row Level Security (RLS) Policies

All tables have RLS enabled:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
```

### 3.1 `profiles` Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 3.2 `daily_metrics` Policies
```sql
-- Users can view their own daily metrics
CREATE POLICY "Users can view own daily metrics"
  ON daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own daily metrics
CREATE POLICY "Users can insert own daily metrics"
  ON daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily metrics
CREATE POLICY "Users can update own daily metrics"
  ON daily_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own daily metrics
CREATE POLICY "Users can delete own daily metrics"
  ON daily_metrics FOR DELETE
  USING (auth.uid() = user_id);
```

### 3.3 `recommendations` Policies
```sql
-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recommendations
CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recommendations
CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. Profile Creation Trigger

To ensure every authenticated user automatically receives an initial profile row upon signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, onboarding_completed)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 5. Migration Strategy & Execution Guide

Migrations are kept as discrete, timestamped/numbered `.sql` files in `supabase/migrations/`:
- [20260921000001_create_profiles.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/20260921000001_create_profiles.sql)
- [20260921000002_create_daily_metrics.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/20260921000002_create_daily_metrics.sql)
- [20260921000003_create_recommendations.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/20260921000003_create_recommendations.sql)
- [20260921000004_create_triggers_and_rls.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/20260921000004_create_triggers_and_rls.sql)
- [combined_migration.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/combined_migration.sql) (All 4 migrations bundled for single-click execution)

### How to Apply Migrations to your Supabase Project:
1. Navigate to your Supabase project dashboard at [https://supabase.com/dashboard/project/oxafqrqtsfjlfwdzoujq](https://supabase.com/dashboard/project/oxafqrqtsfjlfwdzoujq).
2. In the left navigation, click **SQL Editor**.
3. Click **New query**.
4. Copy and paste the entire contents of [combined_migration.sql](file:///c:/Users/ra986/Recovery_Desk/supabase/migrations/combined_migration.sql) into the SQL editor.
5. Click **Run** (or press Ctrl+Enter).
6. Verify under **Table Editor** that `profiles`, `daily_metrics`, and `recommendations` appear with RLS enabled (padlock icon).

