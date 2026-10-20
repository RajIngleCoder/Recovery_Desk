# Recovery Desk

> Turn recovery data into one clear decision for today.

Recovery Desk is a minimalist, wellness-oriented mobile application built with React Native and Expo, backed by Supabase. The app transforms manually entered daily recovery metrics (sleep duration, optional sleep score, HRV, resting heart rate, and subjective activity load) and historical personal baselines into a single, transparent decision for the day: **PUSH**, **MODERATE**, or **RECOVER**.

---

## Important Notice

Recovery Desk is a **wellness decision-support app**. It is **not** a medical diagnostic device and does not diagnose, treat, or prevent any disease, injury, or medical condition. All thresholds, baselines, and recommendations represent product experimentation hypotheses, not medical standards.

---

## What Works in the MVP

The application is complete and verified according to the MVP build specification:

1. **Authentication & Session Management**:
   - Email and password sign-up, sign-in, sign-out, and password reset requests.
   - Secure token persistence using `@react-native-async-storage/async-storage`.
   - Route guarding enforcing redirect logic between `(auth)`, `(onboarding)`, and `(app)`.
2. **Onboarding**:
   - 3-step profile onboarding: Display name, primary wellness goal, and sleep target.
   - Persistence to the Supabase `profiles` table with onboarding status tracking.
3. **Manual Recovery Check-In**:
   - Daily logging of sleep hours and minutes (converted to decimal hours), optional sleep score (0–100), HRV (1–300 ms), resting HR (30–220 bpm), activity load (`Low`, `Moderate`, `High`), and optional notes ($\le 500$ characters).
   - Strict client-side and database-level validation.
   - Support for editing existing entries and deleting entries with confirmation.
4. **Rolling Baseline Calculation Engine**:
   - Pure, testable rolling 14-day baseline computation for HRV, resting HR, and sleep.
   - Minimum observation safeguard: Requires $\ge 3$ recorded days before baselines are declared established; otherwise marks status as `"learning"` with transparent UI feedback.
5. **Deterministic Recovery Engine**:
   - Pure mathematical scoring function producing composite readiness scores (0.0 to 100.0) and status classifications:
     - **PUSH**: $\ge 75.0$
     - **MODERATE**: $50.0 - 74.9$
     - **RECOVER**: $< 50.0$
   - Centralized weights: HRV (40%), Resting HR (30%), Sleep (20%), Activity Load (10%).
   - Transparent contributing factors with physiological sentiment indicators and concise factual rationale.
   - Zero LLM/AI dependencies in scoring logic.
6. **Today / Home Experience**:
   - Dynamic greeting, current calendar date, and primary recovery decision card.
   - Factor breakdown row comparing today's values against established baselines.
   - Detailed "Why this recommendation?" modal with physiological context and non-diagnostic disclaimers.
   - Dynamic empty and retry states.
7. **History & Lightweight Trends**:
   - Chronological list of past 30 days with expandable cards disclosing notes, sleep scores, and rationale.
   - 7-day lightweight bar charts for HRV, Resting HR, and Sleep with rolling baseline reference lines.
   - Recovery status distribution breakdown across logged history.
8. **Security & Data Isolation**:
   - Row Level Security (RLS) active on all PostgreSQL tables (`profiles`, `daily_metrics`, `recommendations`), enforcing `auth.uid() = user_id`.
   - Zero sensitive service-role keys bundled client-side.

---

## Known Limitations

- **Manual Input Only**: Metrics must be entered by the user manually; there is no background or automated wearable sync in this MVP.
- **No Push Notifications**: The app does not send morning check-in reminders or push notifications.
- **Device-Local Date Tracking**: Entries are indexed by the user's local calendar date (`YYYY-MM-DD`). Traveling across the international date line may require manual date selection.
- **Email Verification Behavior**: Handled via standard Supabase Auth; in development environments without custom SMTP, auto-confirm can be toggled in the Supabase Dashboard.

---

## Intentionally Deferred Features

The following features were intentionally excluded from the MVP scope to focus on validating the core decision-support model:

- Native Apple HealthKit & Android Health Connect synchronization (deferred to V1.0).
- Third-party wearable cloud APIs (WHOOP, Oura, Garmin) (deferred to V1.5+).
- Social OAuth sign-in (Google, Apple) (deferred to post-MVP).
- Social feeds, leaderboards, and community sharing (deferred).
- In-app subscriptions, paywalls, and payment processing (deferred).
- Generative AI subjective text embellishment (deferred).

---

## Tech Stack

- **Framework**: React Native with Expo SDK 52+
- **Routing**: Expo Router (file-based navigation with route groups)
- **Language**: TypeScript (strict mode)
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Styling**: Pure React Native `StyleSheet` design system with centralized tokens
- **Testing**: Jest with `ts-jest` for unit testing domain logic and validation

---

## Getting Started

### Prerequisites

- Node.js LTS (v20+ or v22+)
- npm or yarn
- Expo Go on iOS/Android or an iOS Simulator / Android Emulator
- Active Supabase project (cloud or local)

### Installation

1. Clone or open the repository:
   ```bash
   cd Recovery_Desk
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
4. Populate `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
   ```
   *(Never commit or bundle the Supabase `service_role` key).*

### Running Locally

Start the Expo development server:
```bash
npx expo start
```

- Press `a` to launch in the Android Emulator.
- Press `i` to launch in the iOS Simulator.
- Scan the QR code with the Expo Go app on a physical device.

### Running Quality Checks

Run the automated test suite (129 unit tests):
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Validate local Metro production bundling:
```bash
npx expo export -p android --no-bytecode
```

---

## Creating Preview and Release Builds

Recovery Desk is pre-configured with EAS Build (`eas.json`) and Expo Application Services.

### 1. Install EAS CLI and Authenticate

```bash
npm install -g eas-cli
eas login
```

### 2. Configure Environment Secrets on EAS

Set your public Supabase credentials on your Expo project:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --type string
eas secret:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "your-publishable-key" --type string
```

### 3. Build a Preview Package

To generate an installable Android APK for testing on physical devices:
```bash
eas build --profile preview --platform android
```

To generate an iOS Simulator build:
```bash
eas build --profile preview --platform ios
```

### 4. Build a Production Package

To generate a signed Android App Bundle (AAB) for Google Play release:
```bash
eas build --profile production --platform android
```

To generate an iOS App Store submission package:
```bash
eas build --profile production --platform ios
```

---

## Project Documentation

- [MVP Release Checklist](file:///c:/Users/ra986/Recovery_Desk/MVP_RELEASE_CHECKLIST.md): Pre-release audit certification.
- [MVP Build Specification](file:///c:/Users/ra986/Recovery_Desk/Recovery_Desk_MVP_BUILD_SPEC.md): Comprehensive functional requirements.
- [Project Progress](file:///c:/Users/ra986/Recovery_Desk/PROJECT_PROGRESS.md): Detailed phase-by-phase implementation log.
- [Recovery Engine](file:///c:/Users/ra986/Recovery_Desk/RECOVERY_ENGINE.md): Mathematical algorithm and threshold specifications.
- [Database Schema](file:///c:/Users/ra986/Recovery_Desk/DATABASE.md): PostgreSQL schema and RLS security policies.
- [Architecture](file:///c:/Users/ra986/Recovery_Desk/ARCHITECTURE.md): System design and component boundaries.
