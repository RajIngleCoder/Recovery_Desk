# Recovery Desk — Architecture

## 1. Architectural Philosophy

Recovery Desk is designed with a **Domain-Driven, Layered Architecture** that strictly decouples:
- **Presentation (UI)**: Pure visual rendering, input handling, and screen transitions.
- **Application/Services**: Data orchestration, Supabase client interactions, and session state.
- **Domain Engine**: Deterministic, pure mathematical and rule-based functions (recovery calculation, baseline averaging, factor scoring) with zero dependencies on React or Supabase.
- **Infrastructure**: Supabase client, persistence storage, and external API gateways.

This separation ensures that:
1. The decision engine is 100% testable via standard unit tests.
2. In the future, wearable data sources (Apple Health, Health Connect, WHOOP, Oura) can be swapped or added without modifying the core recovery decision engine or rewriting the UI.

---

## 2. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   Expo Router Screens ((auth), (onboarding), (app)/(tabs))  │
│   Reusable Design System Components (AppButton, Card, etc.) │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Actions / Events              │ Reactive State
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                    Application / State Layer                │
│   Custom Hooks (useAuth, useRecovery, useProfile)           │
│   Services (authService, recoveryService, profileService)   │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Fetch data / Persist          │ Raw data
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                        Domain Layer                         │
│   Recovery Engine (calculateRecoveryDecision)               │
│   Baseline Engine (calculateBaselines)                      │
│   Rule Thresholds & Configuration (RECOVERY_CONFIG)         │
│   Types & Normalization Contracts                           │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │ Metrics Data
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│   Supabase Client (Supabase Auth, PostgREST via RLS)        │
│   AsyncStorage (Auth Session Persistence)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```text
Recovery_Desk/
├── app/                        # Expo Router filesystem routing
│   ├── _layout.tsx             # Root layout, AuthProvider, ThemeProvider
│   ├── (auth)/                 # Unauthenticated route group
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/           # First-time user onboarding
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── goal.tsx
│   │   └── sleep-target.tsx
│   └── (app)/                  # Protected authenticated route group
│       ├── _layout.tsx         # Route guard (redirects if not authed/onboarded)
│       ├── (tabs)/             # Main bottom tab navigator
│       │   ├── _layout.tsx
│       │   ├── index.tsx       # Today's Recovery Decision & Factors
│       │   ├── history.tsx     # Past entries list & details
│       │   ├── trends.tsx      # 7-day metric visual charts
│       │   └── profile.tsx     # User settings, targets, sign out
│       ├── check-in.tsx        # Daily manual metrics input modal/screen
│       └── edit-entry.tsx      # Edit existing day's entry
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── Screen.tsx      # Safe area and keyboard scroll wrapper
│   │   │   ├── Card.tsx        # Styled surface container
│   │   │   ├── AppButton.tsx   # Touch target compliant button
│   │   │   ├── AppTextInput.tsx# Accessible input with validation styles
│   │   │   ├── MetricCard.tsx  # Metric summary presentation
│   │   │   ├── StatusBadge.tsx # Visual PUSH / MODERATE / RECOVER indicator
│   │   │   ├── LoadingState.tsx# Loading spinner / skeleton
│   │   │   ├── EmptyState.tsx  # Zero-data friendly fallback
│   │   │   └── ErrorState.tsx  # Clear retryable error display
│   │   └── recovery/           # Recovery-specific composite components
│   │       ├── RecoveryStatusCard.tsx
│   │       ├── RecoveryFactors.tsx
│   │       └── BaselineCard.tsx
│   ├── constants/              # Design tokens
│   │   ├── colors.ts           # Cohesive calm wellness color palette
│   │   ├── spacing.ts          # 4-point/8-point spacing grid
│   │   └── typography.ts       # Type scale, font sizes, line heights
│   ├── domain/
│   │   └── recovery/           # Pure business logic
│   │       ├── types.ts        # RecoveryInput, RecoveryDecision, Factor
│   │       ├── config.ts       # Centralized thresholds & hypotheses
│   │       ├── baseline.ts     # Rolling window baseline calculation
│   │       ├── scoring.ts      # Pure rule-based scoring function
│   │       └── recommendation.ts # Centralized copy generator
│   ├── hooks/                  # React state wrappers
│   │   ├── useAuth.ts          # Auth context hook
│   │   ├── useRecovery.ts      # Recovery query & mutation hook
│   │   └── useProfile.ts       # Profile query & update hook
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client with AsyncStorage
│   │   ├── validation.ts       # Input ranges and schema validators
│   │   └── date.ts             # Date helpers (YYYY-MM-DD parsing & display)
│   ├── services/               # Supabase API services
│   │   ├── authService.ts
│   │   ├── recoveryService.ts
│   │   └── profileService.ts
│   └── types/
│       └── database.ts         # Generated or manual Supabase schema types
```

---

## 4. Authentication and Protected Routing Flow

1. **Session Initialization**:
   - `_layout.tsx` initializes `AuthProvider`.
   - `supabase.auth.getSession()` checks for existing persisted session in `AsyncStorage`.
   - `supabase.auth.onAuthStateChange` listens for login, logout, and token refresh.
2. **Navigation Guard**:
   - While `isLoading`: Render splash/loading screen.
   - If unauthenticated: Route to `/(auth)/sign-in`.
   - If authenticated but profile `onboarding_completed == false`: Route to `/(onboarding)/welcome`.
   - If authenticated and onboarding completed: Route to `/(app)/(tabs)/`.

---

## 5. Pure Domain Engine

### Baseline Calculation (`src/domain/recovery/baseline.ts`)
- Takes an array of recent valid historical entries (e.g., last 7 to 14 days).
- Ignores null or invalid values.
- Requires a minimum threshold (e.g., 3+ entries) before marking the baseline as `established`.
- If fewer than the minimum exist, marks the baseline as `learning` and transparently indicates this to the user.

### Deterministic Recovery Engine (`src/domain/recovery/scoring.ts`)
- Pure function: `calculateRecoveryDecision(input: RecoveryInput): RecoveryDecision`.
- Compares:
  - HRV vs. personal baseline (percentage deviation: `((current - base) / base) * 100`).
  - Resting HR vs. personal baseline (absolute bpm deviation: `current - base`).
  - Sleep duration vs. personal baseline (absolute hour/minute deviation: `current - base`).
  - Subjective activity load (Low / Moderate / High).
- Produces a composite score (0-100) and assigns status:
  - **PUSH** (Score $\ge$ 75): Recovery markers close to or exceeding baseline.
  - **MODERATE** (50 $\le$ Score $<$ 75): Minor deficits or elevated load.
  - **RECOVER** (Score $<$ 50): Significant deficits across multiple recovery markers.
- Produces an array of contributing factors with structured facts.

---

## 6. Future Wearable Integration Pipeline

Although wearable APIs (Apple Health, Health Connect, WHOOP, Oura, Garmin) are explicitly out of scope for the MVP, the architecture anticipates them via an **Adapter Pattern**:

```text
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Manual Form   │  │   Apple Health  │  │      WHOOP      │
│     (MVP)       │  │    (Future)     │  │    (Future)     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌───────────────────────────────────────────────────────────┐
│               Metric Normalization Pipeline               │
│               (Maps provider data to NormalizedMetrics)   │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│          Standardized Daily Metric Storage                │
│                 (daily_metrics Table)                     │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│         Baseline Engine & Recovery Decision Engine        │
│          (Remains 100% untouched by provider changes)     │
└───────────────────────────────────────────────────────────┘
```

Normalized contract:
```typescript
interface NormalizedRecoveryMetrics {
  date: string;
  sleepHours: number;
  sleepScore?: number;
  hrv: number;
  restingHr: number;
  activityLoad: "low" | "moderate" | "high";
  source: "manual" | "apple_health" | "health_connect" | "whoop" | "oura" | "garmin";
}
```
This guarantees that when automated wearable integrations are introduced, zero business logic or scoring algorithms need to be rewritten.
