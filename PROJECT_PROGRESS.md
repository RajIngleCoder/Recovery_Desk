# Recovery Desk MVP Progress

## Current phase
Phase 12 — MVP Preview & Release Build Preparation (Completed — All 12 MVP Phases Finished)

## Completed
- [x] Phase 0 — Project Audit & Documentation:
  - Initial repository inspection and toolchain audit.
  - Complete master specification review.
  - Authored `README.md`, `PROJECT_PROGRESS.md`, `ARCHITECTURE.md`, `MVP_SCOPE.md`, `DATABASE.md`, `RECOVERY_ENGINE.md`, `ENVIRONMENT.md`, `.env.example`.
- [x] Phase 1 — Foundation:
  - Initialized Expo project with TypeScript and Expo Router (`package.json`, `app.json`, `tsconfig.json`, `jest.config.js`).
  - Implemented design system tokens in `src/constants/` (`colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`).
  - Created reusable UI primitives in `src/components/ui/` (`Screen`, `Card`, `AppButton`, `AppTextInput`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`).
  - Configured Supabase client with `@react-native-async-storage/async-storage` session persistence and typesafe environment handling in `src/lib/`.
  - Configured PostgreSQL schema interfaces and generic relationships in `src/types/database.ts`.
  - Built pure authentication & profile services in `src/services/` (`authService.ts`, `profileService.ts`).
  - Created authentication and profile context with session subscription in `src/features/auth/AuthContext.tsx` and `useAuth` hook.
  - Built protected Expo Router navigation structure with route groups `(auth)`, `(onboarding)`, and `(app)`.
  - Created domain recovery contracts and `RECOVERY_CONFIG` in `src/domain/recovery/`.
  - Established Jest test suite and verified domain configuration tests (`3 passed, 100%`).
  - Verified strict TypeScript compilation with zero errors (`tsc --noEmit` exited with code 0).
- [x] Phase 2 — Authentication:
  - Created `src/lib/validation.ts` with testable validation functions (`validateEmail`, `validatePassword`, `validateSignUp`, `validateSignIn`).
  - Implemented `formatAuthError` mapping raw Supabase and network errors into calm, actionable, non-technical messages.
  - Wired full Sign Up flow (`app/(auth)/sign-up.tsx`) with client-side form validation, password confirmation, display name capture, and email verification notice.
  - Wired full Sign In flow (`app/(auth)/sign-in.tsx`) with validation, error banners, and loading state.
  - Implemented Password Reset flow (`app/(auth)/forgot-password.tsx`) with email validation and confirmation feedback.
  - Enhanced `src/features/auth/AuthContext.tsx` with `signIn`, `signUp`, and `resetPassword` methods.
  - Created pure testable route guard logic in `src/features/auth/routeGuard.ts` (`getRouteRedirect`).
  - Implemented strict route protection in `app/_layout.tsx`.
  - Created comprehensive unit tests (30 tests passing).
- [x] Phase 3 — Onboarding:
  - Implemented complete 3-step onboarding flow in `app/(onboarding)/`:
    - `welcome.tsx`: Value proposition overview, 3-step roadmap, non-diagnostic wellness notice, sign out option.
    - `profile.tsx`: Step 1 of 3 (Display name collection, pre-population from auth user metadata, input validation).
    - `goal.tsx`: Step 2 of 3 (Selectable cards for General Recovery, Training & Performance, Daily Fitness).
    - `sleep-target.tsx`: Step 3 of 3 (Quick preset pills `7.0h` to `9.0h`, custom decimal hour input, explanation of baseline learning, submit handling).
  - Added `validateOnboarding` to `src/lib/validation.ts` ensuring name ($\le 50$ chars), valid goal selection, and realistic sleep duration ($4.0 - 16.0$ hours).
  - Implemented loading, save failure error feedback, and complete persistence to Supabase `profiles` via `profileService.completeOnboarding`.
  - Added onboarding test suite in `src/features/onboarding/__tests__/onboarding.test.ts` (9 test cases).
- [x] Phase 4 — Supabase Database:
  - Configured actual project environment variables in `.env` (`https://oxafqrqtsfjlfwdzoujq.supabase.co`).
  - Created formal SQL migrations in `supabase/migrations/`:
    - `20260921000001_create_profiles.sql`: `profiles` table with UUID references `auth.users(id)`, check constraints on `goal` and `sleep_target_hours`, RLS enabled with 4 strict user-ownership policies.
    - `20260921000002_create_daily_metrics.sql`: `daily_metrics` table with check constraints on `sleep_hours` (0-24), `hrv` (0-300), `resting_hr` (30-220), `activity_load`, `UNIQUE(user_id, date)` constraint, composite index `(user_id, date DESC)`, RLS enabled with 4 strict user-ownership policies.
    - `20260921000003_create_recommendations.sql`: `recommendations` table with check constraints on `status` and `score` (0-100), `UNIQUE(user_id, date)` constraint, composite index `(user_id, date DESC)`, RLS enabled with 4 strict user-ownership policies.
    - `20260921000004_create_triggers_and_rls.sql`: `handle_new_user()` trigger for automated initial profile creation, and `update_updated_at_column()` triggers.
    - `combined_migration.sql`: Single copy-pasteable script for executing all migrations in the Supabase Dashboard SQL Editor.
  - Implemented typed `recoveryService` in `src/services/recoveryService.ts` providing typed CRUD operations (`getDailyMetricsForDate`, `getRecentMetrics`, `saveDailyMetrics`, `deleteDailyMetric`, `getRecommendationForDate`, `saveRecommendation`).
  - Created test suite in `src/services/__tests__/recoveryService.test.ts` verifying typed contracts, query parameters, and error handling.
  - Verified tables are live in Supabase: `profiles`, `daily_metrics`, and `recommendations` with RLS active and verified.
- [x] Phase 5 — Manual Recovery Check-In:
  - Built pure date utilities in `src/lib/date.ts` (`getTodayDateString`, `formatDisplayDate`, `hoursAndMinutesToDecimal`, `decimalToHoursAndMinutes`, `formatSleepDuration`, `isValidDateString`).
  - Added strict validation and boundary testing in `src/lib/validation.ts` (`validateDailyMetricsInput`):
    - Date: calendar validity, no future dates, not older than 365 days.
    - Sleep duration: hours (0-23) + minutes (0-59), boundary checks (minimum 0.5 hours / 30 mins, maximum 24.0 hours).
    - Sleep score: optional, boundary check (0 to 100).
    - HRV: required, boundary check (1 to 300 ms).
    - Resting HR: required, boundary check (30 to 220 bpm).
    - Activity load: required selection between Low, Moderate, High with clear subtext guidance.
    - Notes: optional, character limit check ($\le 500$ chars).
  - Implemented calm, non-technical error translation via `formatDailyMetricsError` (mapping unique violation 23505, network failure, check constraints, and RLS denials).
  - Created polished check-in form in `app/(app)/check-in.tsx`:
    - Responsive layout with `KeyboardAvoidingView` and `ScrollView`.
    - Date selector with quick switches ("Today", "Yesterday") and display formatting.
    - Pre-fetching and loading of existing entry for selected date, indicating "Logged" status badge and seamless edit mode.
    - In-line validation feedback and top-level error banners.
    - Real-time sleep duration calculator badge (e.g. `7h 30m (7.5 hrs)`).
    - Activity load segmented card selector (`Low` / `Moderate` / `High`).
    - Notes input with character counter `(X/500)`.
    - Save / Update button with loading state.
    - Delete button with destructive confirmation dialog (`Alert.alert`).
  - Created `app/(app)/edit-entry.tsx` and registered route in `app/(app)/_layout.tsx` for parameterized date editing.
  - Enhanced `recoveryService` with `getDailyMetricById` and `deleteDailyMetricByDate`.
  - Added test suites for date utilities and check-in validation boundaries (6 suites, 90 tests passing).
- [x] Phase 6 — Baseline Calculation:
  - Created pure baseline calculation engine in `src/domain/recovery/baseline.ts`.
  - Implemented `calculateBaseline` computing rolling HRV baseline, resting HR baseline, and sleep baseline.
  - Applied 14-day rolling window (`RECOVERY_CONFIG.baselineWindowDays = 14`), anchored to reference date, excluding future dates.
  - Enforced minimum observation requirement (`RECOVERY_CONFIG.minBaselineObservations = 3`) before declaring baseline `"established"`.
  - Returned `status: "learning"` and `null` for unestablished baseline metrics when observations $< 3$.
  - Handled duplicate same-date entries via deduplication, prioritizing the latest timestamp.
  - Handled abnormal / out-of-range values filtering (`0 < hrv <= 300`, `30 <= rhr <= 220`, `0 < sleep <= 24`).
  - Handled missing optional fields and uneven metric recording across days.
  - Exposed pure utility functions: `deduplicateEntries`, `filterEntriesInWindow`, `isHrvValid`, `isRestingHrValid`, `isSleepValid`, `calculateMetricAverage`.
  - Created comprehensive test suite in `src/domain/recovery/__tests__/baseline.test.ts` (18 test cases).
  - Updated `RECOVERY_ENGINE.md` Section 2.
- [x] Phase 7 — Deterministic Recovery Engine:
  - Created pure recovery engine in `src/domain/recovery/scoring.ts` (`calculateRecoveryDecision`).
  - Computed individual metric subscores (0 - 100) based on mathematical deviations from rolling baselines:
    - HRV subscore (40% weight): deviation % vs baseline.
    - Resting HR subscore (30% weight): bpm deviation vs baseline (lower is better).
    - Sleep subscore (20% weight): hours deviation vs baseline.
    - Activity load subscore (10% weight): low (100), moderate (95), high (85).
  - Computed weighted composite readiness score clamped strictly to $[0.0, 100.0]$ and rounded to 1 decimal place.
  - Classified recovery into PUSH ($\ge 75.0$), MODERATE ($50.0 - 74.9$), or RECOVER ($< 50.0$).
  - Constructed rich contributing factors array (`RecoveryFactor[]`) with metric values, baseline comparisons, sentiments (`positive`, `neutral`, `negative`), and calm descriptive copy.
  - Generated concise factual 1-sentence decision rationale without diagnostic jargon.
  - Handled zero, negative, and extreme inputs via safety clamping (never returns `NaN` or throws).
  - Centralized all thresholds, weights, and copy templates in `src/domain/recovery/config.ts`.
  - Created extensive unit tests in `src/domain/recovery/__tests__/scoring.test.ts` (13 test cases covering good recovery, moderate recovery, poor recovery, boundary cutoffs, learning fallback, zero/negative clamping, and non-diagnostic verification).
  - Updated `RECOVERY_ENGINE.md` Sections 5, 6, and 7.
- [x] Phase 8 — Home / Recommendation Experience:
  - Built modular presentation components in `src/components/recovery/`:
    - `RecoveryStatusCard`: Displays status badge (`PUSH` / `MODERATE` / `RECOVER`), score pill (`X / 100`), decision title, actionable suggestion, and factual reasoning summary.
    - `RecoveryFactors`: Displays comparative rows (HRV, Resting HR, Sleep duration, Activity load) with deviation tags, values vs baseline, and color-coded sentiments.
    - `BaselineLearningBanner`: Contextual learning card rendered whenever history $< 3$ observations, showing logged count, remaining count, and calm non-technical explanation.
  - Implemented reactive, polished home screen in `app/(app)/(tabs)/index.tsx`:
    - Dynamic personalized greeting ("Good morning / afternoon / evening, {displayName}").
    - Formatted current calendar date.
    - Auto-refreshing on screen focus via `useFocusEffect` and pull-to-refresh (`RefreshControl`).
    - Clear empty state when no metrics are logged for today, with direct call-to-action button to log metrics.
    - "Add / Edit today's data" dynamic buttons.
    - "Why this recommendation?" button navigating to modal breakdown.
    - Useful retry state (`ErrorState`) with error handling and retry action.
  - Implemented detailed breakdown screen in `app/(app)/recommendation-details.tsx`:
    - Detailed factor-by-factor breakdown with numerical deviations and physiological rationale.
    - Metric definition context and baseline calculation explanation.
    - Plain English non-diagnostic disclaimer.
  - Created presentation test suite in `src/components/recovery/__tests__/presentation.test.ts`.
  - Verified with 9 passing test suites (124 tests passing) and zero TypeScript errors.
- [x] Phase 9 — History and Trends Experience:
  - Built pure domain trends engine in `src/domain/recovery/trends.ts` (`calculateTrends`, `calculateTrendDirection`, `getDayOfWeekLabel`, `getShortCalendarDate`).
  - Created modular, lightweight chart components in `src/components/trends/`:
    - `LightweightBarChart.tsx`: Pure React Native bar chart with interactive day inspection banner, rolling baseline reference line, x-axis day/date labels, and zero heavy dependencies.
    - `TrendMetricCard.tsx`: Displays 7-day average, 14-day baseline, trend direction badge (`Improving ↗` / `Stable →` / `Declining ↘` / `Learning`), lightweight bar chart, and contextual baseline explanation.
    - `TrendStatusDistribution.tsx`: Visual breakdown of recovery decisions (PUSH / MODERATE / RECOVER counts and percentage bar).
  - Built comprehensive History tab in `app/(app)/(tabs)/history.tsx`:
    - Lists recent 30 days chronologically with newest first.
    - Renders status badges, formatted calendar dates, and key metrics grid (HRV, RHR, Sleep, Activity Load).
    - Expandable card disclosing recommendation title, factual rationale, sleep score, and personal notes.
    - Direct "Edit Entry" button routing to check-in form with date param.
    - "Delete Entry" button with confirmation alert and atomic removal of metric and recommendation from Supabase.
    - Clear empty state with CTA to log today's metrics.
    - Pull-to-refresh (`RefreshControl`) and `useFocusEffect` lifecycle updates.
  - Built comprehensive Trends tab in `app/(app)/(tabs)/trends.tsx`:
    - 7-day lightweight trend charts for HRV (ms), Resting HR (bpm), and Sleep (hours).
    - Rolling 14-day baseline reference lines on charts when established ($\ge 3$ days).
    - `BaselineLearningBanner` when history is partial ($< 3$ days), still showing logged trend points.
    - Clear empty state when 0 entries exist.
    - Prominent non-diagnostic wellness tracking notice clarifying that trends are algorithmic lifestyle pacing indicators, not medical diagnostics.
  - Added test suite in `src/domain/recovery/__tests__/trends.test.ts` testing empty history, partial history (1-2 entries), full history (5+ entries), and utilities.
  - Verified with 10 passing test suites (129 tests passing) and 0 TypeScript errors.
- [x] Phase 10 — Production-Quality UI Polish:
  - Comprehensive audit and refinement across every application screen:
    - **Safe Areas**: Audited and calibrated `Screen.tsx` edge insets; updated tab screens (`index.tsx`, `history.tsx`, `trends.tsx`, `profile.tsx`) with `edges={["top", "left", "right"]}` to eliminate double bottom insets above the tab bar.
    - **Keyboard Behavior**: Streamlined `KeyboardAvoidingView` behavior in `Screen.tsx` to `Platform.OS === "ios" ? "padding" : undefined`, eliminating Android height-resize jitter; removed redundant nested `KeyboardAvoidingView` in `check-in.tsx`.
    - **Touch Targets**: Enforced $\ge 44/48\text{pt}$ minimum touch target heights across all interactive buttons, link rows, quick-date selectors, load cards, and back/close navigation buttons.
    - **Accessibility Labels**: Audited and confirmed `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityState` across interactive elements.
    - **States**: Verified clean loading spinners and indicators, rich contextual empty states, error retry cards, and disabled styling.
    - **Typography, Spacing & Color Consistency**: Cleaned typography tokens to strictly use defined sizes (`base` vs ad-hoc values); ensured strict dark mode surface and contrast harmony.
    - **Navigation & Button Consistency**: Standardized `AppButton` variants (`primary`, `secondary`, `outline`, `ghost`, `danger`); harmonized modal header layouts.
    - **Dead Code Removal**: Removed unused imports, dead styles, temporary scratch scripts, and legacy `temp_router` directory.
  - Full automated verification: 10 test suites passed (129 tests passed), 0 TypeScript compiler errors.
- [x] Phase 11 — Complete QA Pass and End-to-End Verification:
  - **Automated Verification**: TypeScript compilation (0 errors), 129 unit tests (0 failures), Metro production bundling clean (1,350 modules bundled).
  - **Authentication QA**: Sign-up, sign-in, session restore from storage, route protection and redirects.
  - **Onboarding QA**: Stepped progression, data validation, database persistence, and profile completion flag.
  - **Data Layer QA**: Check-in creation, editing, duplicate date prevention, atomic deletion, range validation.
  - **Recovery Engine QA**: PUSH/MODERATE/RECOVER scoring, baseline learning mode, zero/negative bounds clamping.
  - **UI & Accessibility QA**: Safe area behavior, 44pt touch targets, keyboard avoidance, responsive layouts.
  - **Security QA**: Client-side secrets inspection (only publishable key present), `.gitignore` audit, RLS multi-tenant isolation verified.
- [x] Phase 12 — MVP Preview & Release Build Preparation:
  - Audited production environment configuration: Live Supabase backend verified, only public publishable key bundled.
  - Audited application configuration in `app.json`: Bundle ID (`com.recoverydesk.app`), Android package (`com.recoverydesk.app`), dark wellness splash screen (`#090D16`), adaptive launcher icons configured.
  - Configured EAS Build (`eas.json`) with `development`, `preview` (APK / simulator), and `production` (AAB) profiles.
  - Audited codebase for integrity: Zero development-only secrets, zero debug screens, zero fake wearable integrations.
  - Created formal `MVP_RELEASE_CHECKLIST.md` certifying release readiness across security, configuration, and testing.
  - Updated `README.md` with complete MVP capability report, limitations, deferred items, local run instructions, and EAS build commands.

## In progress
- None (All MVP Phases Complete).

## Next
- None (Ready for User Testing & Preview Build Deployment).

## Decisions
- **Decision 001**: Manual entry only for MVP. Direct integrations (Apple Health, Health Connect, WHOOP, Oura, Garmin) are explicitly deferred until product decision usefulness is validated with 5+ test users.
- **Decision 002**: Pure deterministic recovery engine. No LLM or AI will be used to calculate recovery score or decide PUSH/MODERATE/RECOVER status. Scoring thresholds are documented as product hypotheses, not medical standards.
- **Decision 003**: Native StyleSheet architecture with centralized design tokens instead of third-party CSS compilers, ensuring rock-solid stability and small bundle size across Expo platforms.
- **Decision 004**: Route groups with Expo Router `(auth)`, `(onboarding)`, `(app)/(tabs)` protecting private user routes and preventing unauthenticated access.
- **Decision 005**: Strict client-side security. No Supabase `service_role` keys will ever be bundled. Supabase Row Level Security (RLS) is strictly enforced on all tables (`auth.uid() = user_id`).
- **Decision 006**: Centralized `RECOVERY_CONFIG` in `src/domain/recovery/config.ts` ensures zero magic numbers in components or services.
- **Decision 007**: Centralized error formatting via `formatAuthError` and `formatDailyMetricsError` in `src/lib/validation.ts` guarantees that technical database or PostgREST error messages are never shown to the user.
- **Decision 008**: Stepped onboarding (`welcome` -> `profile` -> `goal` -> `sleep-target`) minimizes cognitive load while strictly capturing only necessary recovery context (no invasive medical questionnaires).
- **Decision 009**: PostgreSQL constraints enforce data integrity at database level (`UNIQUE(user_id, date)`, value ranges for HRV, RHR, Sleep, Activity Load).
- **Decision 010**: Dual input for sleep (Hours + Minutes) converts to decimal sleep hours (`NUMERIC(4,2)`) in the database while maintaining a natural, human-friendly user experience.
- **Decision 011**: Upsert on `(user_id, date)` allows seamless switching between creating and editing an entry for any given date without throwing duplicate key errors.
- **Decision 012**: Strict baseline reliability rule: when observations $< 3$, baseline values are `null` and status is `"learning"`. The app refuses to display unestablished baselines as authoritative.
- **Decision 013**: Deterministic weighted scoring: HRV (40%), Resting HR (30%), Sleep (20%), Activity Load (10%) provides balanced, responsive daily readiness without medical diagnostic claims.
- **Decision 014**: Home Screen Reactive Presentation Architecture: The home screen fetches recent metrics, computes rolling baselines, and calculates deterministic recovery decisions on-the-fly upon focus (`useFocusEffect`), syncing the resulting recommendation to Supabase in the background. If today's data does not exist, the UI strictly displays an actionable empty state without fabricating numbers.
- **Decision 015**: Lightweight SVG-less Charting Architecture: Rather than importing heavy or unstable external charting libraries, trend visualizations are implemented with pure React Native components using absolute and percentage styling (`LightweightBarChart`). This delivers 60fps rendering, tiny bundle footprint, full dark-mode integration, zero dependency conflicts, and complete cross-platform reliability.
- **Decision 016**: UI Polish and Responsive Cross-Platform Inset Discipline: All tab routes explicitly omit bottom safe area insets to allow the native tab bar to manage bottom padding naturally. Modal screens and auth flows maintain minimum 44pt touch targets with accessibility roles to adhere strictly to iOS and Android human interface guidelines without introducing third-party animation or layout overhead.
- **Decision 017**: Comprehensive Pre-Release Quality Certification: All 11 architectural phases, automated test suites (129 tests across 10 suites), Metro bundling exports, and multi-tenant RLS policies verified to pass 100% without mocks or fabrications before declaring the product MVP-complete.
- **Decision 018**: EAS Release Configuration Discipline: Standalone preview profile generates installable Android APKs and iOS simulator builds for internal tester distribution, while production builds output signed Android App Bundles (AAB). Development-only secrets and mock routes are strictly excluded.

## Known issues
- None. All TypeScript checks, bundling exports, and 129 unit tests pass cleanly.

## Deferred
- Apple HealthKit integration (Deferred to V1).
- Android Health Connect integration (Deferred to V1).
- WHOOP API / Oura API / Garmin API (Deferred to V1.5+).
- Google / Apple OAuth login (Deferred to post-MVP; email/password only for initial validation).
- Background wearable data synchronization (Deferred).
- Push notifications / morning reminders (Deferred).
- Subscriptions and payment billing (Deferred).
- Social sharing and community feeds (Deferred).
- AI wording embellishment (Deferred until core deterministic engine and UI flows are tested).

## Database migrations
- `20260921000001_create_profiles.sql` (Executed in Supabase)
- `20260921000002_create_daily_metrics.sql` (Executed in Supabase)
- `20260921000003_create_recommendations.sql` (Executed in Supabase)
- `20260921000004_create_triggers_and_rls.sql` (Executed in Supabase)
- `combined_migration.sql` (Executed in Supabase)

## Test status
- Jest unit tests: 10 test suites passed, 129 tests passed, 0 failures.
  - `PASS src/domain/recovery/__tests__/trends.test.ts`
  - `PASS src/components/recovery/__tests__/presentation.test.ts`
  - `PASS src/domain/recovery/__tests__/scoring.test.ts`
  - `PASS src/domain/recovery/__tests__/baseline.test.ts`
  - `PASS src/domain/recovery/__tests__/config.test.ts`
  - `PASS src/services/__tests__/recoveryService.test.ts`
  - `PASS src/lib/__tests__/validation.test.ts`
  - `PASS src/lib/__tests__/date.test.ts`
  - `PASS src/features/onboarding/__tests__/onboarding.test.ts`
  - `PASS src/features/auth/__tests__/routeGuard.test.ts`
- TypeScript check (`tsc --noEmit`): Passed with 0 errors.
- Metro Build Export (`expo export`): Bundled 1,350 modules cleanly with 0 errors.

## Last updated
2026-09-21 (Phase 12 MVP Preview & Release Build Preparation Complete)


- [x] Phase 13 — Positioning, Brand Trust & UX Enhancements (Priority 1 & 2 Completed):
  - **Signature Feature Elevation**: Transformed `See full reasoning →` into `Explain My Recovery →` with prominent trust indicators.
  - **Copy De-Medicalization**: Replaced clinical jargon (`autonomic`, `physiological`, `cellular regeneration`) with athletic decision language.
  - **Mathematical Transparency**: Added `pointsBreakdown` drawer showing exact 40/30/20/10 point math (`18/40 pts HRV`, etc.).
  - **Humanized Metric Formatting**: Replaced raw decimal hours (e.g. `-0.94h`) with duration syntax (`-56m vs your baseline`).
  - **Personal Baseline Philosophy**: Added dedicated baseline philosophy card in Trends highlighting 14-day personal calibration vs generic population averages.
  - **Marketing Demo Persona**: Implemented `DemoContext` and `Marketing Screenshot Mode` toggle in Profile to safely mask PII with `Alex Morgan` (`alex@example.com`).
  - **Verification**: Verified zero TypeScript errors across the codebase and 133/133 passing Jest unit and scenario tests.
