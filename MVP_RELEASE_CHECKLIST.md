# Recovery Desk — MVP Release Checklist

This document certifies that the **Recovery Desk** mobile MVP application is fully audited, verified, and prepared for preview and release builds according to the specifications in `Recovery_Desk_MVP_BUILD_SPEC.md`.

---

## 1. Environment & Secrets Verification

- [x] **No Service-Role Secrets Committed**: Audited `.env`, `.env.example`, and all source code. Only the public anonymous publishable key (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) is bundled client-side.
- [x] **Gitignore Protection**: `.gitignore` explicitly excludes `.env` and `.env.*`.
- [x] **Environment Template**: `.env.example` is maintained with placeholder documentation for team onboarding.
- [x] **Production URL**: Configured with live Supabase project: `https://oxafqrqtsfjlfwdzoujq.supabase.co`.

---

## 2. Supabase & Database Security Verification

- [x] **Live Schema Verified**:
  - `profiles`: User profile, display name, goal, sleep target, onboarding status.
  - `daily_metrics`: Manual recovery check-in logs with PostgreSQL range check constraints.
  - `recommendations`: Deterministic recovery scores, statuses, and factual rationale.
- [x] **Row Level Security (RLS) Active**:
  - All three tables have `ENABLE ROW LEVEL SECURITY`.
  - Strict 4-policy coverage (SELECT, INSERT, UPDATE, DELETE) enforcing `auth.uid() = user_id` (or `id` on profiles).
  - Cross-user data isolation verified (User A cannot access or mutate User B's rows).
- [x] **Automated Trigger**: `on_auth_user_created` trigger automatically provisions empty user profiles upon sign up.

---

## 3. Build & Package Configuration

- [x] **Bundle Identifiers**:
  - iOS: `com.recoverydesk.app`
  - Android Package: `com.recoverydesk.app`
- [x] **App Icons & Splash**:
  - App Icon: `./assets/images/icon.png`
  - Android Adaptive Icon: Foreground, background, and monochrome assets configured with dark wellness branding (`#090D16`).
  - Splash Screen: Configured with `splash-icon.png`, dark background `#090D16`, and `contain` resize mode.
- [x] **EAS Build Profiles (`eas.json`)**:
  - `development`: Internal dev-client distribution.
  - `preview`: Generates standalone Android APK and iOS simulator build for device testing.
  - `production`: Generates release AAB (Android App Bundle) with auto-incrementing version codes.
- [x] **Metro Bundling Validation**: Verified via `expo export -p android` (1,350 modules bundled cleanly, 0 errors).

---

## 4. Feature & Integrity Audit

- [x] **Zero Fake Integrations**: No deceptive mock buttons or fake Apple Health / WHOOP sync toggles. The Profile settings page transparently states that wearable data connections are planned for future versions (`COMING LATER`).
- [x] **Zero Debug Screens**: All routes belong to authenticated application screens, onboarding, or auth flows. No test/debug routes or temporary scratch code present.
- [x] **Zero AI in Scoring**: Deterministic, pure mathematical recovery engine (`src/domain/recovery/scoring.ts`) computes readiness and factual reasons using fixed hypotheses.
- [x] **Zero Fabricated Data**: When metrics are missing, the UI renders actionable empty states. When history $< 3$ entries, the baseline is explicitly marked as `"learning"` rather than inventing numbers.
- [x] **Non-Diagnostic Policy**: Prominent wellness tracking disclaimers on onboarding, home breakdown, trends, and profile screens.

---

## 5. Automated Test Certification

- **TypeScript Compilation**: `tsc --noEmit` passed with **0 errors**.
- **Unit Test Suite**: **10 test suites passed, 129 tests passed, 0 failures**.
  1. `src/domain/recovery/__tests__/trends.test.ts` (5 tests)
  2. `src/domain/recovery/__tests__/scoring.test.ts` (13 tests)
  3. `src/domain/recovery/__tests__/baseline.test.ts` (18 tests)
  4. `src/domain/recovery/__tests__/config.test.ts` (3 tests)
  5. `src/components/recovery/__tests__/presentation.test.ts` (3 tests)
  6. `src/services/__tests__/recoveryService.test.ts` (8 tests)
  7. `src/lib/__tests__/validation.test.ts` (32 tests)
  8. `src/lib/__tests__/date.test.ts` (14 tests)
  9. `src/features/onboarding/__tests__/onboarding.test.ts` (9 tests)
  10. `src/features/auth/__tests__/routeGuard.test.ts` (24 tests)

---

## 6. Release Sign-Off

- **Current Build Target**: MVP 1.0.0
- **Scope Certification**: Strictly limited to manual recovery check-ins, rolling baseline learning, deterministic recovery recommendations, and 7-day trend visualization.
- **Production Status**: Ready for internal preview distribution and user testing.
