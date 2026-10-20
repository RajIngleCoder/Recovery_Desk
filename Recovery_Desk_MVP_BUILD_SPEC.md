# Recovery Desk — Antigravity MVP Build Specification

## 0. Purpose of this document

This document is the single source of truth for building the first MVP of **Recovery Desk** with an AI coding agent such as Antigravity.

The goal is NOT to build a complete wearable platform yet.

The goal is to build a polished, working mobile MVP that lets a user:

1. Create an account / sign in.
2. Complete a minimal onboarding flow.
3. Enter recovery data manually.
4. Save that data to Supabase.
5. Establish a simple personal baseline from historical entries.
6. Calculate a transparent recovery status using deterministic rules.
7. Show one clear morning recommendation.
8. Explain why the recommendation was produced.
9. View recent history and trends.
10. Edit/delete entries safely.
11. Work responsively on common iOS and Android phone sizes.
12. Persist authentication and app data correctly.
13. Be architected so Apple Health/Health Connect/WHOOP integrations can be added later without rewriting the core decision engine.

Do NOT build wearable integrations, watch apps, subscriptions, payments, social features, chat, or complicated AI agents in this MVP unless explicitly requested later.

---

# 1. Product definition

## Product name

**Recovery Desk**

## Core promise

> Turn recovery data into one clear decision for today.

## Problem

Wearable users can see many metrics such as sleep, HRV, resting heart rate, and activity/load, but raw metrics do not necessarily answer the practical morning question:

> "What should I do today?"

Recovery Desk is intended to transform recent recovery metrics and the user's own baseline into a concise wellness-oriented recommendation.

## MVP positioning

Recovery Desk is a wellness/recovery decision-support app.

It is NOT a medical diagnostic product.

The app must never claim to diagnose disease, injury, infection, overtraining syndrome, medical conditions, or other clinical states.

Use language such as:

- "Your recent metrics are below your usual range."
- "Consider keeping today's activity light."
- "Your recovery markers are close to your recent baseline."
- "Based on your recent data, moderate activity may be appropriate."

Avoid:

- "You are sick."
- "You have an infection."
- "You are medically overtrained."
- "Your body is inflamed."
- "You definitely need rest."

---

# 2. Technology decisions

Use exactly this stack for MVP unless a real technical blocker requires a change.

## Mobile

- React Native
- Expo
- TypeScript
- Expo Router
- Functional React components
- React hooks

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Supabase Edge Functions only when server-side logic is genuinely needed

## State management

Prefer simple React state for local screen state.

Use a lightweight centralized state solution only where shared state actually requires it.

Do not introduce Redux unless there is a demonstrated need.

## Styling

Use a consistent design system with reusable components.

Do not scatter arbitrary styles throughout screens.

If using NativeWind, configure it correctly and use it consistently. Otherwise use StyleSheet-based React Native styling.

Do not mix multiple styling systems unnecessarily.

## Navigation

Use Expo Router and route groups.

Create protected authenticated routes rather than manually pushing users around with navigation hacks.

## Environment variables

Use Expo-compatible environment variables.

Example:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Never put Supabase service-role keys in the mobile application.

Never commit secrets.

## Database

Supabase PostgreSQL.

Every user-owned table must use Row Level Security.

Users must only be able to access their own private data.

---

# 3. Important implementation principles

The AI coding agent must follow these rules throughout development.

## Rule 1 — Do not assume requirements

If something is not explicitly specified, choose the smallest sensible implementation that fits the MVP.

Do not invent major product features.

If a choice could affect architecture or data integrity, document the decision in `PROJECT_PROGRESS.md` before implementing it.

## Rule 2 — Do not rewrite working code unnecessarily

Before changing an existing feature:

1. Inspect the current implementation.
2. Understand its dependencies.
3. Make the smallest safe change.
4. Run/build/test the affected area.
5. Update progress documentation.

## Rule 3 — Working interactions are mandatory

Every button shown in the UI must either:

- perform the intended action,
- navigate somewhere meaningful,
- submit/save data,
- open a documented interaction,
- or be explicitly disabled with a visible reason.

Never create decorative buttons that appear functional but do nothing.

## Rule 4 — No fake functionality

Do not claim an integration exists when it does not.

For example, do NOT create a "Connect WHOOP" button that silently does nothing.

Future integrations can appear in the architecture documentation, but should not be presented as working MVP functionality.

## Rule 5 — Loading, empty, error and success states are required

Every data-driven screen must have:

- loading state
- success state
- empty state
- error state

Mutating actions must provide visible feedback.

## Rule 6 — Validate inputs

Manual health/recovery inputs must have:

- reasonable ranges
- numeric validation
- clear units
- helpful error messages
- prevention of impossible values

Do not silently accept malformed data.

## Rule 7 — Accessibility

Use:

- accessible labels where needed
- sufficient text contrast
- touch targets around 44x44 points or larger where practical
- readable font sizes
- support for Dynamic Type where practical
- meaningful button labels

Do not rely only on color to communicate recovery status.

## Rule 8 — Responsive mobile UI

The app must work on common small and large phones.

Avoid:

- fixed absolute positioning for core layout
- hard-coded screen dimensions
- content that gets clipped
- text overflowing cards
- keyboard covering inputs
- buttons hidden behind safe areas

Use SafeAreaView / safe-area handling, ScrollView, KeyboardAvoidingView where appropriate, Flexbox and responsive dimensions.

## Rule 9 — Security

Never expose:

- service role keys
- database passwords
- API secrets
- private OAuth credentials

The client should use the Supabase publishable key and rely on RLS for database authorization.

Sensitive third-party credentials must be handled server-side when required.

## Rule 10 — Database integrity

Use foreign keys, appropriate constraints, timestamps, and indexes.

Do not duplicate user identity unnecessarily.

Use the authenticated Supabase user ID as the ownership key.

---

# 4. MVP scope

## Included

### Authentication

- Sign up
- Sign in
- Sign out
- Session persistence
- Forgot password / reset flow if practical in the current Expo setup
- Protected authenticated routes

For MVP, email/password authentication is sufficient.

Do not add Google/Apple login unless explicitly requested later.

### Onboarding

Collect only information that is useful for the MVP.

Suggested:

- first name / display name
- primary goal:
  - General recovery
  - Training
  - Fitness
- normal sleep target in hours

Do not collect unnecessary health information.

### Manual daily metrics

The user can enter:

- date
- sleep duration
- sleep score (optional)
- HRV
- resting heart rate
- yesterday's activity/load
- optional notes

For load, use a simple controlled scale:

- Low
- Moderate
- High

Do not pretend this is an official WHOOP/Oura metric.

Clearly label it as a user-entered estimate.

### Baseline

The MVP should calculate a personal baseline from previous valid entries.

For the initial version:

- HRV baseline = average of recent valid HRV values
- Resting HR baseline = average of recent valid resting HR values
- Sleep baseline = average of recent valid sleep durations

Use a minimum amount of history before calling something a "baseline".

If there is insufficient history, explicitly show:

> "We're still learning your baseline."

Do not pretend the baseline is reliable after one data point.

### Recovery decision

The MVP produces one of:

- PUSH
- MODERATE
- RECOVER

These are wellness-oriented labels, not medical judgments.

### Explanation

Show the main factors used in the decision.

Example:

- HRV relative to baseline
- resting HR relative to baseline
- sleep relative to baseline
- recent user-entered load

Do not fabricate reasons.

### History

Show recent entries and recommendations.

### Trend

Show simple 7-day trends for:

- HRV
- resting HR
- sleep

Use simple charts or compact visualizations.

### Profile/settings

Include:

- account email
- display name
- sleep target
- sign out
- delete account placeholder only if it can be implemented safely; otherwise document it as post-MVP

### Disclaimer

Add a concise wellness disclaimer in an appropriate place, such as onboarding/settings:

> Recovery Desk provides general wellness information based on the data you enter. It is not medical advice and does not diagnose or treat health conditions. If you have health concerns, consult a qualified healthcare professional.

---

# 5. Explicitly out of scope

Do NOT implement these in MVP:

- Oura API
- WHOOP API
- Garmin API
- Apple HealthKit integration
- Android Health Connect integration
- Apple Watch app
- Wear OS app
- background wearable synchronization
- push notifications
- subscriptions
- payment processing
- referral system
- social feed
- friends
- chat
- AI coach chat
- medical diagnosis
- disease prediction
- ML model training
- complex machine learning
- automatic workout programming
- calorie recommendations
- supplement recommendations
- medication recommendations
- emergency health alerts

Create architecture that can support future integrations, but do not build them now.

---

# 6. Core user flow

The primary flow must be:

```text
Open app
  ↓
Authenticated?
  ├── No → Sign in / Sign up
  └── Yes
       ↓
Completed onboarding?
  ├── No → Onboarding
  └── Yes
       ↓
Home / Today's Recovery
       ↓
Has today's data?
  ├── No → Enter today's data
  └── Yes → Show recommendation
       ↓
Recommendation
       ↓
Why this recommendation?
       ↓
History / Trends
```

---

# 7. Suggested route structure

Use Expo Router.

Suggested structure:

```text
app/
  _layout.tsx

  (auth)/
    _layout.tsx
    sign-in.tsx
    sign-up.tsx
    forgot-password.tsx

  (onboarding)/
    _layout.tsx
    welcome.tsx
    profile.tsx
    goal.tsx
    sleep-target.tsx

  (app)/
    _layout.tsx

    (tabs)/
      _layout.tsx
      index.tsx
      history.tsx
      trends.tsx
      profile.tsx

    check-in.tsx
    recommendation.tsx
    recommendation-details.tsx
    edit-entry.tsx
```

Use route groups to keep authentication/onboarding/app navigation separated.

Use protected routes based on the authenticated session.

---

# 8. Suggested source structure

Keep business logic outside UI components.

```text
src/
  components/
    ui/
      AppButton.tsx
      AppTextInput.tsx
      Card.tsx
      Screen.tsx
      LoadingState.tsx
      EmptyState.tsx
      ErrorState.tsx
      MetricCard.tsx
      StatusBadge.tsx

    recovery/
      RecoveryStatusCard.tsx
      RecoveryFactors.tsx
      RecommendationCard.tsx
      BaselineCard.tsx

  features/
    auth/
    onboarding/
    recovery/
    profile/

  lib/
    supabase.ts
    validation.ts
    date.ts

  services/
    authService.ts
    recoveryService.ts
    profileService.ts

  domain/
    recovery/
      types.ts
      baseline.ts
      scoring.ts
      recommendation.ts

  hooks/
    useAuth.ts
    useProfile.ts
    useRecovery.ts

  constants/
    colors.ts
    spacing.ts
    typography.ts

  types/
    database.ts

  utils/
```

The exact structure can be adjusted if Expo Router conventions require it, but maintain clear separation between:

- UI
- database access
- domain logic
- validation
- reusable components

---

# 9. Database schema

Create migrations rather than manually relying on an undocumented dashboard-only schema.

Suggested tables:

## profiles

```text
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
display_name TEXT
goal TEXT
sleep_target_hours NUMERIC
onboarding_completed BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

## daily_metrics

```text
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
date DATE NOT NULL
sleep_hours NUMERIC NOT NULL
sleep_score NUMERIC NULL
hrv NUMERIC NOT NULL
resting_hr NUMERIC NOT NULL
activity_load TEXT NOT NULL
notes TEXT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, date)
```

## recommendations

```text
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
date DATE NOT NULL
status TEXT NOT NULL
score NUMERIC NOT NULL
reason_data JSONB NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()

UNIQUE(user_id, date)
```

Do not store secrets in these tables.

Do not store raw third-party OAuth tokens in the mobile database.

---

# 10. RLS requirements

Enable RLS on every user-owned table.

Policies must ensure:

```text
auth.uid() = user_id
```

for:

- SELECT
- INSERT
- UPDATE
- DELETE

For `profiles`, ownership is based on `id = auth.uid()`.

Never create a policy that allows every authenticated user to read every user's recovery data.

Test RLS explicitly.

---

# 11. Recovery engine

The recovery engine must be deterministic in MVP.

Do not use an LLM to decide whether the user should PUSH/MODERATE/RECOVER.

Create a pure function such as:

```ts
calculateRecoveryDecision(input): RecoveryDecision
```

The function should be:

- deterministic
- testable
- independent of React
- independent of Supabase
- independent of Gemini
- easy to replace later

Example conceptual inputs:

```ts
type RecoveryInput = {
  hrv: number;
  hrvBaseline: number;
  restingHr: number;
  restingHrBaseline: number;
  sleepHours: number;
  sleepBaseline: number;
  activityLoad: "low" | "moderate" | "high";
};
```

Calculate deviations.

Example:

```text
HRV deviation %
= ((current HRV - baseline HRV) / baseline HRV) * 100
```

Example:

```text
RHR deviation
= current RHR - baseline RHR
```

Example:

```text
Sleep deviation
= current sleep - baseline sleep
```

Use a simple weighted rule system.

IMPORTANT:

The exact weights are an MVP hypothesis, not scientifically validated medical thresholds.

Keep all thresholds in one configuration module.

Do not scatter magic numbers across the codebase.

Example conceptual configuration:

```ts
RECOVERY_CONFIG = {
  hrvNegativeDeviation: -15,
  hrvCautionDeviation: -5,
  restingHrElevated: 5,
  sleepDeficitHours: 1,
  pushScoreThreshold: 75,
  moderateScoreThreshold: 50,
};
```

Document that these values are product experimentation values and must not be presented as clinical thresholds.

---

# 12. Baseline calculation

Implement a baseline service.

Initial approach:

- use the most recent valid historical window
- ignore missing/null values
- require enough observations before declaring a stable baseline
- expose whether the baseline is "learning" or "established"

Example:

```ts
type BaselineStatus = "learning" | "established";
```

If the user has only one or two entries:

> "We're still learning your normal range. Add a few more days of data."

Do not give a false impression of precision.

---

# 13. Recommendation copy

Create a centralized recommendation mapping.

Example:

```text
PUSH

Title:
You're looking good today.

Body:
Your recent recovery markers are close to or better than your usual range.

Action:
Your data supports a normal training day, if that matches how you feel.
```

```text
MODERATE

Title:
Keep today moderate.

Body:
Some recovery markers are below your recent baseline.

Action:
Consider keeping intensity moderate and reassessing how you feel.
```

```text
RECOVER

Title:
Consider taking it easy today.

Body:
Several recent metrics are below your usual range.

Action:
Consider lighter activity and prioritizing recovery.
```

Avoid medical language.

---

# 14. AI usage

AI is optional for MVP.

If used, AI should only improve wording/explanation.

The deterministic engine decides:

```text
PUSH / MODERATE / RECOVER
```

AI receives structured facts and generates concise natural language.

AI must NOT:

- invent metrics
- change the status
- diagnose conditions
- make medical claims
- infer unavailable information

Preferred pipeline:

```text
Supabase data
   ↓
Baseline calculation
   ↓
Deterministic recovery engine
   ↓
Structured explanation facts
   ↓
Optional AI wording
   ↓
UI
```

If a secure AI API call cannot be implemented without exposing a secret in the mobile app, do not put the secret in the client. Use a Supabase Edge Function or omit AI from MVP.

---

# 15. UI / visual direction

Recovery Desk should feel:

- calm
- premium
- trustworthy
- minimal
- modern
- wellness-focused
- data-aware without looking like a spreadsheet

Do NOT copy Oura or WHOOP's UI.

Create an original visual identity.

Suggested visual direction:

- warm off-white / deep neutral background depending on chosen theme
- one primary accent color
- restrained use of status colors
- large readable typography
- generous spacing
- rounded cards
- subtle borders
- restrained shadows
- clean charts

Avoid:

- excessive gradients
- glassmorphism everywhere
- neon fitness aesthetics
- excessive emojis
- cluttered dashboards
- tiny text
- giant numbers with no context

---

# 16. Design system

Create centralized tokens:

```ts
colors
spacing
radius
typography
shadows
```

Example component hierarchy:

```text
Screen
 ├── Header
 ├── Card
 │    ├── Metric
 │    └── Status
 └── AppButton
```

Every screen should use the shared design system.

Do not create one-off button styles for every screen.

---

# 17. Home screen specification

The home screen is the most important screen.

### Top

```text
Good morning, [Name]
Monday, September 21
```

### Main card

```text
TODAY'S RECOVERY

MODERATE

Keep today's activity moderate.
```

### Factors

```text
HRV
48 ms
↓ 11% vs baseline

Resting HR
62 bpm
↑ 4 bpm vs baseline

Sleep
6h 42m
↓ 58m vs baseline
```

### Action

```text
Today's suggestion

Keep intensity moderate and
pay attention to how you feel.

[ Why this recommendation? ]
```

If there is no data:

```text
Today's recovery isn't ready yet.

Add your recovery data to get
your first recommendation.

[ Add today's data ]
```

---

# 18. Manual check-in screen

Fields:

## Sleep

Use hours/minutes input.

## HRV

Numeric input.

Unit:

```text
ms
```

## Resting heart rate

Numeric input.

Unit:

```text
bpm
```

## Activity load

Segmented control:

```text
Low | Moderate | High
```

## Optional notes

Multiline input.

Primary CTA:

```text
Get my recommendation
```

Validate everything before submission.

---

# 19. History screen

Display chronological daily entries.

Each row:

```text
Sep 21
MODERATE

Sleep 6h 42m
HRV 48
RHR 62
```

Tap opens details.

Allow editing and deleting the user's own entries.

Confirm destructive deletion.

---

# 20. Trends screen

Show 7-day data.

At minimum:

- HRV line chart
- resting HR line chart
- sleep line/bar chart

Also show:

```text
Your baseline
```

Do not create charts that imply scientific certainty.

If there is insufficient data:

> "Add a few more days to see your trend."

---

# 21. Profile/settings screen

Include:

- display name
- goal
- sleep target
- account email
- app version
- wellness disclaimer
- sign out

Future integrations can appear as a disabled/future section only if clearly labeled:

```text
Data connections
Coming later
```

Do not create fake connection flows.

---

# 22. Authentication

Use Supabase Auth.

The session must persist across app restarts.

Use current Supabase + Expo React Native patterns.

The authenticated app routes must be protected.

Unauthenticated users must not be able to navigate into private screens and see another user's data.

Handle:

- loading session
- sign in errors
- sign up errors
- invalid credentials
- network errors
- expired session

Do not log passwords or tokens.

---

# 23. Supabase client

Use the current official Supabase Expo React Native setup.

Use the publishable client key in the app.

Use persistent session storage appropriate for Expo/React Native.

Follow current Supabase documentation rather than inventing authentication/session code.

Reference:

https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native

---

# 24. Error handling

Every network/database operation should handle errors.

User-facing messages should be understandable.

Bad:

```text
PostgrestError code 23505
```

Good:

```text
We couldn't save today's data.
Please check your connection and try again.
```

Log technical details only in development/debug tooling.

Do not expose secrets or raw backend errors to users.

---

# 25. Offline behavior

MVP does not need a full offline sync engine.

However:

- don't crash when the network is unavailable
- show a useful error
- avoid clearing unsaved form input unnecessarily

Document full offline support as post-MVP.

---

# 26. Performance

Avoid unnecessary re-renders.

Do not fetch the same data repeatedly.

Use appropriate memoization only when it provides value.

Use FlatList for potentially growing lists.

Keep charts lightweight.

Do not load huge datasets when only the last 7–30 days are needed.

---

# 27. Testing requirements

Create unit tests for:

- baseline calculations
- HRV deviation
- resting HR deviation
- sleep deviation
- recovery scoring
- PUSH/MODERATE/RECOVER classification
- insufficient-data behavior
- validation

Create integration tests for important Supabase operations where practical.

Before declaring MVP complete, manually test:

### Authentication

- sign up
- email confirmation behavior
- sign in
- sign out
- session persistence
- invalid login

### Data

- create entry
- edit entry
- delete entry
- duplicate same-day entry behavior
- empty data
- insufficient history

### Recovery

- good recovery scenario
- moderate scenario
- poor recovery scenario
- boundary values

### UI

- small phone
- large phone
- keyboard open
- long text
- loading
- network error
- empty state

---

# 28. Development documentation

Create and maintain:

```text
PROJECT_PROGRESS.md
```

This file is mandatory.

It must contain:

```md
# Recovery Desk MVP Progress

## Current phase
...

## Completed
- [x] ...
- [x] ...

## In progress
- [ ] ...

## Next
- [ ] ...

## Decisions
- ...

## Known issues
- ...

## Deferred
- ...

## Database migrations
- ...

## Test status
- ...

## Last updated
...
```

Update this file after every meaningful development phase.

Do not mark something complete until it is actually implemented and tested.

---

# 29. Additional required documentation

Create:

```text
README.md
PROJECT_PROGRESS.md
ARCHITECTURE.md
MVP_SCOPE.md
DATABASE.md
RECOVERY_ENGINE.md
ENVIRONMENT.md
```

## README.md

Explain:

- what Recovery Desk is
- how to install
- how to run
- environment variables
- project structure
- testing
- Supabase setup

## ARCHITECTURE.md

Explain:

- frontend architecture
- routing
- auth
- Supabase
- domain layer
- recovery engine
- future wearable adapters

## MVP_SCOPE.md

Explicitly list:

- included
- excluded
- future work

## DATABASE.md

Document:

- tables
- columns
- relationships
- RLS
- migrations

## RECOVERY_ENGINE.md

Document:

- formulas
- thresholds
- scoring
- assumptions
- limitations
- test scenarios

## ENVIRONMENT.md

Document required environment variables without committing secret values.

---

# 30. Future wearable architecture

Do NOT implement now, but design for this future:

```text
                    ┌── Manual Input
                    │
                    ├── Apple Health
                    │
                    ├── Health Connect
                    │
                    ├── WHOOP
                    │
                    ├── Oura
                    │
                    └── Garmin
                           ↓
                    Data Normalization
                           ↓
                    Normalized Metrics
                           ↓
                    Baseline Service
                           ↓
                    Recovery Engine
                           ↓
                    Recommendation
```

Every provider should eventually have an adapter that maps provider-specific data into a common internal type.

Example:

```ts
type NormalizedRecoveryMetrics = {
  date: string;
  sleepHours?: number;
  sleepScore?: number;
  hrv?: number;
  restingHr?: number;
  activityLoad?: number;
  source: "manual" | "apple_health" | "health_connect" | "whoop" | "oura" | "garmin";
};
```

Do not let provider-specific fields leak throughout the UI.

---

# 31. Antigravity execution protocol

The AI coding agent must NOT attempt the entire application in one uncontrolled generation.

Work in phases.

At the start of every phase:

1. Read `PROJECT_PROGRESS.md`.
2. Read relevant architecture documentation.
3. Inspect existing source files.
4. Determine what is already implemented.
5. Implement only the current phase.
6. Run formatting/lint/type checking.
7. Run relevant tests.
8. Fix errors.
9. Manually verify the affected flow if possible.
10. Update `PROJECT_PROGRESS.md`.
11. Report exactly what changed.

Never claim a task is complete merely because code was generated.

---

# 32. Phase plan

## Phase 0 — Project audit

- inspect existing repository
- identify Expo SDK/version
- identify router setup
- identify TypeScript configuration
- identify installed packages
- identify current Supabase configuration
- identify existing screens/components
- do not overwrite working work
- create documentation files
- create `PROJECT_PROGRESS.md`

## Phase 1 — Foundation

- establish project structure
- design tokens
- shared UI primitives
- Supabase client
- environment configuration
- Expo Router structure
- authentication context/session handling

## Phase 2 — Authentication

- sign up
- sign in
- sign out
- protected routes
- session persistence
- error/loading states

## Phase 3 — Onboarding

- welcome
- display name
- goal
- sleep target
- onboarding completion persistence

## Phase 4 — Database

- create migrations
- profiles
- daily_metrics
- recommendations
- RLS
- indexes
- generated TypeScript database types if appropriate

## Phase 5 — Manual check-in

- form
- validation
- save
- edit
- delete
- loading/error/success states

## Phase 6 — Baseline

- historical data retrieval
- baseline calculations
- learning vs established state
- tests

## Phase 7 — Recovery engine

- deterministic scoring
- PUSH/MODERATE/RECOVER
- reason generation
- unit tests
- boundary tests

## Phase 8 — Home recommendation

- today's recommendation
- factor cards
- recommendation details
- empty state
- insufficient data state

## Phase 9 — History and trends

- history
- 7-day trends
- charts
- entry details
- edit/delete

## Phase 10 — Polish

- responsive layouts
- accessibility
- keyboard handling
- safe areas
- animations only where useful
- loading states
- error states
- empty states
- visual consistency

## Phase 11 — QA

- lint
- TypeScript
- unit tests
- manual test matrix
- fix bugs
- update documentation

## Phase 12 — MVP release build

- Expo/EAS configuration
- development build
- preview build
- release checklist
- verify production environment variables
- verify Supabase RLS
- verify no secrets are bundled

---

# 33. Definition of done

The MVP is NOT complete until all of these are true:

- [ ] App launches successfully.
- [ ] User can sign up.
- [ ] User can sign in.
- [ ] Session persists after restart.
- [ ] Protected routes work.
- [ ] Onboarding works.
- [ ] Profile is stored in Supabase.
- [ ] User can enter today's recovery data.
- [ ] Data is stored securely.
- [ ] RLS prevents cross-user access.
- [ ] User can edit data.
- [ ] User can delete data.
- [ ] Baseline is calculated correctly.
- [ ] Insufficient history is handled honestly.
- [ ] Recovery engine is deterministic.
- [ ] PUSH/MODERATE/RECOVER works.
- [ ] Explanation matches actual data.
- [ ] Home screen works.
- [ ] History works.
- [ ] Trends work.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error states work.
- [ ] Keyboard does not hide critical controls.
- [ ] UI works on small and large phone screens.
- [ ] TypeScript has no unresolved errors.
- [ ] Lint/format checks pass.
- [ ] Recovery engine tests pass.
- [ ] Documentation is updated.
- [ ] No secrets are committed.
- [ ] No fake wearable integration is presented as functional.
- [ ] No medical diagnosis is presented.

---

# 34. Master Antigravity prompt

Use the following prompt as the initial instruction to the coding agent.

---

You are the senior engineer responsible for building **Recovery Desk**, a React Native + Expo mobile MVP backed by Supabase.

Read the entire `MVP_BUILD_SPEC.md` file before changing code.

Do not assume requirements that are not written.

The product is:

> Recovery Desk — turn recovery data into one clear decision for today.

The first MVP does NOT connect to Oura, WHOOP, Garmin, Apple Health, Android Health Connect, or watches. Users manually enter a small set of recovery metrics.

The MVP must prove whether users find a concise daily recovery recommendation useful.

### Technology

Use:

- React Native
- Expo
- TypeScript
- Expo Router
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase RLS

Do not replace these technologies.

### Engineering standard

Build production-quality code, not a throwaway prototype.

Use:

- clear separation of concerns
- reusable components
- domain/business logic outside UI
- typed data
- validation
- error handling
- loading states
- empty states
- secure environment variables
- RLS
- testable pure functions
- small focused files
- meaningful names
- no unnecessary dependencies
- no duplicated logic
- no magic numbers scattered through code

Do not use service-role Supabase keys in the mobile app.

### Product behavior

The user must be able to:

1. Sign up.
2. Sign in.
3. Complete onboarding.
4. Enter today's:
   - sleep hours
   - optional sleep score
   - HRV
   - resting HR
   - activity load
   - optional notes
5. Save the entry.
6. Calculate their baseline from historical entries.
7. Receive one status:
   - PUSH
   - MODERATE
   - RECOVER
8. See why.
9. See history.
10. See simple trends.
11. Edit/delete their own entries.
12. Sign out.

### Recovery engine

Do not let AI decide the recovery status.

Implement a deterministic domain service.

It must compare:

- current HRV vs personal HRV baseline
- current resting HR vs personal resting HR baseline
- current sleep vs personal sleep baseline
- recent activity load

Return a structured result:

```ts
{
  status: "PUSH" | "MODERATE" | "RECOVER",
  score: number,
  factors: [...],
  summary: string
}
```

Keep thresholds centralized and documented as product hypotheses, not medical thresholds.

If insufficient historical data exists, clearly say the baseline is still being learned.

### AI

AI is optional.

If AI is used, it may only turn structured deterministic facts into readable wording.

It cannot:

- change the recovery status
- invent metrics
- diagnose
- provide medical claims
- infer unavailable information

Never put an AI secret key in the mobile app. Use a secure server-side function if needed.

### UI

Make the app polished, responsive, calm and premium.

Use a consistent design system.

Every screen must work on small and large phones.

Every button must work.

Every data operation must have loading/error/success behavior.

Do not create fake buttons or fake integrations.

Use original design rather than copying Oura/WHOOP.

### Supabase

Create proper migrations.

Tables:

- profiles
- daily_metrics
- recommendations

Use UUID ownership through authenticated `auth.uid()`.

Enable RLS.

Users must only access their own records.

Add indexes and constraints where appropriate.

### Documentation

Create and maintain:

- README.md
- PROJECT_PROGRESS.md
- ARCHITECTURE.md
- MVP_SCOPE.md
- DATABASE.md
- RECOVERY_ENGINE.md
- ENVIRONMENT.md

After every meaningful phase, update `PROJECT_PROGRESS.md`.

### Execution

Do NOT implement everything at once.

Start with Phase 0.

First inspect the existing repository.

Then:

1. Tell me what already exists.
2. Tell me what is missing.
3. Create/update the documentation.
4. Implement only the current phase.
5. Run checks/tests.
6. Fix errors.
7. Update `PROJECT_PROGRESS.md`.
8. Stop and report what was completed.

Do not proceed to the next major phase until the current phase is verified.

---

# 35. Phase prompts for Antigravity

Use these one at a time after the master prompt.

## Prompt — Phase 0

```text
Read MVP_BUILD_SPEC.md completely.

Start Phase 0 only.

Inspect the entire existing repository before making changes.

Determine:

- Expo SDK version
- React Native version
- TypeScript setup
- Expo Router setup
- existing screens
- existing components
- installed dependencies
- Supabase setup
- environment files
- current build configuration
- existing tests
- existing lint/format setup

Do not delete or rewrite working code.

Create/update:

- README.md
- PROJECT_PROGRESS.md
- ARCHITECTURE.md
- MVP_SCOPE.md
- DATABASE.md
- RECOVERY_ENGINE.md
- ENVIRONMENT.md

Record what actually exists.

Do not implement the product yet unless necessary to establish the foundation.

Run available checks.

Update PROJECT_PROGRESS.md.

Report:
1. Current architecture.
2. Problems found.
3. Files created/changed.
4. Checks performed.
5. Next recommended phase.
```

## Prompt — Phase 1

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 1: Foundation.

Set up a clean Expo Router structure, shared design tokens, reusable UI primitives, Supabase client configuration, environment handling, and authentication/session architecture.

Do not build wearable integrations.

Do not build the recovery engine yet.

Follow current official Expo and Supabase patterns.

Make sure:
- TypeScript is strict enough to catch meaningful errors.
- secrets are not hardcoded.
- navigation structure is clean.
- components are reusable.
- safe areas are handled.
- loading/error states have reusable components.

Run TypeScript/lint/tests.

Fix all issues you introduce.

Update PROJECT_PROGRESS.md and ARCHITECTURE.md.

Stop after Phase 1.
```

## Prompt — Phase 2

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 2: Authentication.

Use Supabase Auth.

Implement:
- sign up
- sign in
- sign out
- session persistence
- authentication loading state
- invalid credentials handling
- protected Expo Router routes
- logged-out route access
- logged-in route access

Do not add Google/Apple auth yet.

Do not expose service-role keys.

Use current Supabase + Expo Router authentication patterns.

Test:
- new user
- existing user
- invalid credentials
- logout
- app restart/session persistence
- protected route behavior

Update PROJECT_PROGRESS.md.

Stop after Phase 2.
```

## Prompt — Phase 3

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 3: onboarding.

Create a short onboarding flow collecting:
- display name
- primary goal
- sleep target

Persist it in profiles.

Do not collect unnecessary personal or health information.

Handle:
- loading
- save failure
- incomplete onboarding
- app restart
- returning user

After completion, route the user to the authenticated app.

Test the full flow.

Update PROJECT_PROGRESS.md.

Stop after Phase 3.
```

## Prompt — Phase 4

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 4: Supabase database.

Create migrations for:
- profiles
- daily_metrics
- recommendations

Add:
- UUIDs
- foreign keys
- timestamps
- unique user/date constraint
- useful indexes
- appropriate check constraints where practical

Enable RLS.

Users must only be able to access their own data.

Create typed database interfaces/types.

Test RLS and basic CRUD.

Do not weaken security to make the client work.

Update DATABASE.md and PROJECT_PROGRESS.md.

Stop after Phase 4.
```

## Prompt — Phase 5

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 5: manual recovery check-in.

Build a polished form for:
- sleep hours
- optional sleep score
- HRV
- resting HR
- activity load: Low / Moderate / High
- optional notes

Add strong validation and useful error messages.

Save to daily_metrics.

Prevent duplicate entries for the same user/date.

Allow editing an existing day.

Allow deleting an entry with confirmation.

Handle loading, success and failure.

Do not calculate the final recovery status yet unless needed for wiring.

Test all validation boundaries.

Update PROJECT_PROGRESS.md.

Stop after Phase 5.
```

## Prompt — Phase 6

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 6: baseline calculation.

Create pure, testable baseline functions.

Calculate:
- HRV baseline
- resting HR baseline
- sleep baseline

Use an appropriate recent historical window.

Require enough observations before declaring the baseline established.

Return:
- baseline values
- data count
- learning/established status

Do not pretend a baseline is reliable with insufficient data.

Create unit tests for:
- empty data
- one entry
- sufficient entries
- missing optional fields
- abnormal values
- duplicate dates

Update RECOVERY_ENGINE.md and PROJECT_PROGRESS.md.

Stop after Phase 6.
```

## Prompt — Phase 7

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 7: deterministic recovery engine.

Create a pure function that receives normalized recovery inputs and returns:

- PUSH / MODERATE / RECOVER
- score
- contributing factors
- concise factual reason

Centralize thresholds in one configuration module.

Do not use AI.

Do not use database code inside the pure scoring function.

Do not make medical claims.

Create extensive unit tests for:
- good recovery
- moderate recovery
- poor recovery
- boundary values
- insufficient data
- zero/invalid values

Document the algorithm and make clear that thresholds are product hypotheses, not clinical standards.

Update RECOVERY_ENGINE.md and PROJECT_PROGRESS.md.

Stop after Phase 7.
```

## Prompt — Phase 8

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 8: home/recommendation experience.

The home screen should clearly show:

- greeting
- date
- today's status
- concise recommendation
- HRV vs baseline
- resting HR vs baseline
- sleep vs baseline
- recent load
- button to see why
- button to add/edit today's data

If no data exists:
show a clear empty state.

If insufficient history exists:
show that the baseline is still being learned.

If there is an error:
show a useful retry state.

Make the screen polished and responsive.

Do not fabricate data.

Update PROJECT_PROGRESS.md.

Stop after Phase 8.
```

## Prompt — Phase 9

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 9: history and trends.

History:
- list recent days
- show status
- show key metrics
- open details
- edit/delete

Trends:
- HRV
- resting HR
- sleep
- baseline reference where appropriate

Use lightweight charts.

Handle insufficient data.

Do not imply medical certainty from the charts.

Test empty, partial and full history.

Update PROJECT_PROGRESS.md.

Stop after Phase 9.
```

## Prompt — Phase 10

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Implement Phase 10: production-quality UI polish.

Audit every screen for:

- safe areas
- keyboard behavior
- small screens
- large screens
- text overflow
- touch targets
- accessibility labels
- loading states
- empty states
- errors
- disabled states
- consistent spacing
- typography
- colors
- button consistency
- navigation consistency

Remove duplicated styles.

Remove dead code.

Do not add unnecessary animations.

Do not add new product features.

Run all checks.

Update PROJECT_PROGRESS.md.

Stop after Phase 10.
```

## Prompt — Phase 11

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Perform a complete QA pass.

Run:
- TypeScript
- lint
- formatting
- unit tests
- build validation

Test manually:

Authentication:
- sign up
- sign in
- logout
- restart
- protected routes

Onboarding:
- first user
- returning user
- incomplete onboarding

Data:
- create
- edit
- delete
- duplicate date
- invalid values

Recovery:
- PUSH
- MODERATE
- RECOVER
- insufficient baseline

UI:
- small phone
- large phone
- keyboard
- network error
- loading
- empty state

Security:
- inspect environment files
- ensure no secrets are committed
- verify RLS
- verify user A cannot read user B data

Fix every issue discovered.

Update PROJECT_PROGRESS.md with actual results.

Do not claim QA is complete if a check failed.
```

## Prompt — Phase 12

```text
Read MVP_BUILD_SPEC.md and PROJECT_PROGRESS.md.

Prepare the app for an MVP preview/release build.

Do not add new features.

Verify:
- production environment configuration
- Supabase project
- RLS
- authentication
- app icon/splash placeholders if needed
- bundle identifiers/configuration
- EAS configuration
- no development-only secrets
- no debug screens
- no fake integrations

Create a final MVP release checklist.

Update README.md and PROJECT_PROGRESS.md.

Report:
- what works
- known limitations
- what is intentionally deferred
- how to run the app
- how to create the preview/release build

Do not claim the app is production-ready beyond the documented MVP scope.
```

---

# 36. After MVP: future roadmap

Only after real testers use the MVP:

## V1

- Apple Health integration
- Android Health Connect integration
- automatic daily sync
- better baseline learning
- notifications
- improved onboarding

## V1.5

- WHOOP integration
- provider normalization
- data-sync status
- background refresh where supported

## V2

- additional wearable integrations
- watch experience
- personalized recommendations
- better trend analysis
- paid plans if users demonstrate willingness to pay

Before implementing any wearable provider, review that provider's current API requirements, permissions, commercial terms, and data-use restrictions.

---

# 37. Product validation goal

The first success metric is NOT:

- downloads
- followers
- waitlist size
- App Store impressions

The first product-validation goal is:

> **5 real people use Recovery Desk repeatedly for approximately one week and give concrete feedback about whether the daily recommendation changes or improves their decision-making.**

Only after that should major integration work begin.

---

# 38. Final instruction to the AI coding agent

Do not optimize for the amount of code produced.

Optimize for:

- correctness
- working interactions
- maintainability
- security
- clear UX
- testability
- documented decisions
- fast validation

When uncertain, choose the smallest implementation that proves the product hypothesis.

Never invent functionality.

Never hide errors.

Never claim a feature is complete without verifying it.
