# Recovery Desk — MVP Scope

## 1. Executive Summary

Recovery Desk answers one practical question for health-conscious users every morning:
> **"What should I do today based on my recovery data?"**

The purpose of the MVP is to validate whether users find a **concise, transparent daily decision** (PUSH / MODERATE / RECOVER) actionable and valuable before investing in complex wearable API agreements and integrations.

---

## 2. In Scope (MVP)

### Authentication & Account
- Email and password sign-up and sign-in via Supabase Auth.
- Persistent session storage across app restarts.
- Sign out.
- Route protection (prevent unauthenticated access to private screens).
- Basic password reset request.

### Onboarding
- Lightweight onboarding questionnaire:
  - Display name
  - Primary recovery goal (General recovery, Training, Fitness)
  - Target sleep duration (hours)
- Non-blocking wellness disclaimer presentation.
- Onboarding completion flag persisted to profile.

### Daily Metric Check-In (Manual Entry)
- Date picker / default today.
- Sleep duration (hours and minutes).
- Optional sleep score (0–100).
- Heart Rate Variability (HRV in milliseconds).
- Resting Heart Rate (RHR in beats per minute).
- Subjective activity load (Segmented control: Low, Moderate, High).
- Optional personal notes.
- Strict input validation with user-friendly error banners.

### Personal Baseline Calculation
- Rolling baseline computation using up to 14 days of prior valid entries.
- Separate baselines for HRV, resting HR, and sleep duration.
- Minimum threshold (3 entries) required for an "established" baseline.
- Honest state indication: clearly displays `"We're still learning your normal range"` when fewer than 3 entries exist.

### Recovery Engine
- Pure, deterministic scoring algorithm.
- Centralized configuration thresholds (`RECOVERY_CONFIG`).
- Computes percentage deviation for HRV, absolute deviation for RHR, and deficit/surplus for sleep.
- Assigns one status: **PUSH**, **MODERATE**, or **RECOVER**.
- Generates structured factors explaining the primary drivers of the recommendation.

### User Interface & Experience
- **Today (Home)**:
  - Personalized greeting and current date.
  - Primary Recovery Decision Card (`PUSH` / `MODERATE` / `RECOVER`).
  - Key recovery factor cards (HRV, RHR, Sleep vs. baseline).
  - Clear empty state prompting for today's check-in.
  - "Why this recommendation?" drilldown modal or section.
- **History**:
  - Chronological daily feed of previous entries with recovery status badges.
  - Edit and delete capabilities for the user's own previous entries.
- **Trends**:
  - 7-day lightweight visual charts for HRV, Resting HR, and Sleep.
  - Visual baseline reference lines.
- **Profile / Settings**:
  - Account email display.
  - Editable display name and sleep targets.
  - Prominent wellness disclaimer.
  - Sign out button.

### Security & Storage
- Supabase PostgreSQL database with Row Level Security (RLS) enabled on all tables.
- Authentication tokens stored securely in client device storage via AsyncStorage.
- Absolutely no Supabase service-role keys bundled in the mobile application.

---

## 3. Explicitly Out of Scope (Excluded from MVP)

To maintain focus and avoid prototype bloat, the following are strictly **NOT** implemented in this MVP:

- ❌ **Direct Wearable Integrations**: Apple HealthKit, Android Health Connect, WHOOP API, Oura API, Garmin API.
- ❌ **Companion Apps**: Apple Watch, Wear OS, widget extensions.
- ❌ **Background Sync**: Automatic background fetch or webhook ingest.
- ❌ **Push Notifications**: Morning reminders or bedtime alerts.
- ❌ **Commercial Features**: In-app subscriptions, Stripe/StoreKit paywalls, paid tiers.
- ❌ **Social & Community**: Friend feeds, leaderboards, recovery sharing, in-app messaging.
- ❌ **AI Chat / LLM Scoring**: No AI-driven diagnosis or generative chat coaches.
- ❌ **Clinical / Medical Features**: Disease detection, overtraining diagnosis, cardiac arrhythmia detection, injury rehabilitation protocols, calorie or medication prescriptions.

---

## 4. Product Validation Target

The success metric for this MVP is:
> **5 real users log their recovery manually for at least 7 consecutive days and provide concrete qualitative feedback confirming whether the daily recommendation altered or improved their daily physical activity and rest choices.**

---

## 5. Post-MVP Roadmap

### Version 1.0 (Wearable Sync)
- Apple Health integration (read sleep, HRV, resting HR).
- Android Health Connect integration.
- Background daily sync.
- Enhanced baseline calculation with 30-day weighted exponential moving averages.

### Version 1.5 (Cloud Wearable Ingest)
- WHOOP Developer API integration.
- Oura Cloud API integration.
- Provider normalization layer.
- Push notification reminders.

### Version 2.0 (Intelligent Context)
- Wear OS & watchOS companion widgets.
- Optional AI natural language synthesis of deterministic recovery facts (via secure Edge Functions).
- Exportable PDF summaries for coaches/trainers.
