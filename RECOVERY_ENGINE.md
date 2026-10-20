# Recovery Desk — Recovery Engine Specification

## 1. Non-Diagnostic Disclaimer

The Recovery Desk Recovery Engine is a **deterministic wellness decision-support model**. It does not perform medical diagnosis, detect pathology, or replace professional medical guidance. All formulas, weights, and thresholds are **product experimentation hypotheses** designed to provide actionable daily guidance.

---

## 2. Personal Baseline Engine (`src/domain/recovery/baseline.ts`)

Personal baselines represent the user's individual historical rolling average over recent days. Using individual baselines prevents misleading population-average judgments (e.g., an athlete with an HRV of 90 ms vs. someone with an HRV of 35 ms).

### 2.1 Window and Eligibility
- **Rolling Window Size**: 14 previous calendar days (`RECOVERY_CONFIG.baselineWindowDays = 14`).
- **Anchor Reference Date**: Anchored to the most recent entry date or user-provided reference date (rejecting future dates).
- **Minimum Required Data Points**: 3 entries (`RECOVERY_CONFIG.minBaselineObservations = 3`).
- **State Classification**:
  - `status: "learning"`: When $N < 3$ observations exist for any primary biomarker.
  - `status: "established"`: When $N \ge 3$ observations exist for all key biomarkers.

### 2.2 Deduplication and Abnormal Value Filtering
1. **Deduplication**: Multiple entries submitted for the same calendar date are deduplicated. The latest entry (by timestamp) is retained, ensuring that multiple check-in edits on the same day never skew the baseline.
2. **Physiological Boundary Checks**: Corrupt, malformed, or out-of-range values are filtered per metric before computing means:
   - **HRV**: Requires $0 < \text{HRV} \le 300\,\text{ms}$.
   - **Resting HR**: Requires $30 \le \text{RHR} \le 220\,\text{bpm}$.
   - **Sleep Duration**: Requires $0 < \text{Sleep} \le 24.0\,\text{hours}$.
3. **Missing Optional Fields**: Missing optional fields (e.g. `sleep_score`, `notes`, or an unentered biomarker on a given day) are handled gracefully without corrupting other valid metrics.

### 2.3 Baseline Formulas & Precision
For valid historical values $\{x_1, x_2, \dots, x_N\}$ in the rolling window:
- **Baseline HRV**: $\text{Baseline}_{\text{HRV}} = \frac{1}{N}\sum_{i=1}^N \text{hrv}_i$, rounded to 1 decimal place.
- **Baseline Resting HR**: $\text{Baseline}_{\text{RHR}} = \frac{1}{N}\sum_{i=1}^N \text{resting\_hr}_i$, rounded to 1 decimal place.
- **Baseline Sleep Duration**: $\text{Baseline}_{\text{Sleep}} = \frac{1}{N}\sum_{i=1}^N \text{sleep\_hours}_i$, rounded to 2 decimal places.

### 2.4 Insufficient Data Contract
When $N < 3$, the engine explicitly refuses to present unverified averages as established baselines:
- `hrvBaseline = null`
- `restingHrBaseline = null`
- `sleepBaseline = null`
- `status = "learning"`
- Provisional averages are retained internally under `result.provisional` for telemetry and debugging, but never passed as established baseline values to the UI.
- The UI displays: *"We're still learning your normal range. Add a few more days of data."*

---

## 3. Deviations & Metric Scoring

### 3.1 Mathematical Formulations

1. **HRV Percentage Deviation**:
   $$\Delta \text{HRV}\% = \left(\frac{\text{Current HRV} - \text{Baseline HRV}}{\text{Baseline HRV}}\right) \times 100$$
   *Higher is generally positive; lower indicates autonomic nervous system strain.*

2. **Resting HR Absolute Deviation**:
   $$\Delta \text{RHR} = \text{Current RHR} - \text{Baseline RHR} \quad (\text{bpm})$$
   *Lower or baseline is positive; elevated RHR (+3 bpm or higher) indicates incomplete recovery or stress.*

3. **Sleep Duration Deviation**:
   $$\Delta \text{Sleep} = \text{Current Sleep Hours} - \text{Baseline Sleep Hours} \quad (\text{hours})$$
   *Surplus is positive; deficit (e.g., $-1.0\text{h}$) detracts from recovery readiness.*

---

## 4. Centralized Thresholds & Weights (`RECOVERY_CONFIG`)

All thresholds and scoring weights are strictly centralized in `src/domain/recovery/config.ts`:

```typescript
export const RECOVERY_CONFIG = {
  // Baseline observation requirement
  minBaselineObservations: 3,
  baselineWindowDays: 14,

  // Weightings for composite recovery score (must sum to 1.0)
  weights: {
    hrv: 0.40,        // 40% HRV deviation impact
    rhr: 0.30,        // 30% Resting Heart Rate deviation impact
    sleep: 0.20,      // 20% Sleep duration impact
    activityLoad: 0.10 // 10% Subjective load impact
  },

  // HRV thresholds (% deviation)
  hrv: {
    excellent: 5,     // >= +5% vs baseline -> full points
    normal: -5,       // -5% to +5% -> normal range
    mildDeficit: -15, // -15% to -5% -> mild recovery penalty
    severeDeficit: -15 // < -15% -> heavy penalty
  },

  // Resting Heart Rate thresholds (bpm deviation from baseline)
  rhr: {
    optimal: -1,      // <= -1 bpm below baseline
    normal: 2,        // <= +2 bpm above baseline
    mildElevated: 5,  // +3 to +5 bpm above baseline
    elevated: 5       // > +5 bpm above baseline
  },

  // Sleep deficit thresholds (hours deviation from baseline)
  sleep: {
    surplus: 0.5,     // >= +0.5h over baseline
    normal: -0.5,     // within 30 mins of baseline
    mildDeficit: -1.5,// 30m to 1.5h deficit
    severeDeficit: -1.5 // > 1.5h deficit
  },

  // Activity Load impact (deductions from subscore)
  activityLoadPenalty: {
    low: 0,
    moderate: 5,
    high: 15
  },

  // Final Decision Cutoffs (Score between 0 and 100)
  statusThresholds: {
    push: 75,         // Score >= 75
    moderate: 50      // 50 <= Score < 75; Score < 50 => RECOVER
  },

  // Centralized recommendation copy templates
  copy: {
    push: {
      title: "You're in a great spot today",
      body: "Your key recovery markers are close to or exceeding your recent baseline.",
      action: "Your body is responding well. A normal or high-intensity training day is well-supported if you feel ready.",
    },
    moderate: {
      title: "Keep today moderate",
      body: "Some of your recovery markers are slightly below your usual baseline range.",
      action: "Consider keeping intensity steady and moderate. Listen to your body and adjust if fatigue sets in.",
    },
    recover: {
      title: "Prioritize rest and recovery today",
      body: "Multiple recovery markers indicate accumulated physical or physiological strain.",
      action: "Consider an easy recovery walk, mobility work, or an active rest day to recharge your system.",
    },
    learning: {
      title: "Recovery data logged",
      body: "We're still learning your normal baseline range.",
      action: "Add a few more days of data to establish your personalized baseline.",
    },
  },
} as const;
```

---

## 5. Scoring Algorithm (`src/domain/recovery/scoring.ts`)

The scoring function is 100% pure TypeScript:
- Zero database or network imports.
- Zero AI / LLM dependencies.
- Zero medical diagnostic claims.
- Clamped inputs preventing `NaN` or division by zero on corrupt/missing data.

### 5.1 Sub-score Formulations (0 - 100)

1. **HRV Sub-score**:
   - $\Delta \text{HRV}\% \ge +5\%$: $90 + \min(10, (\Delta\% - 5) \times 1.0)$ [Optimal]
   - $-5\% \le \Delta \text{HRV}\% < +5\%$: $75 + \frac{\Delta\% - (-5)}{10} \times 15$ [Normal]
   - $-15\% \le \Delta \text{HRV}\% < -5\%$: $50 + \frac{\Delta\% - (-15)}{10} \times 25$ [Mild Deficit]
   - $\Delta \text{HRV}\% < -15\%$: $\max(0, 50 + (\Delta\% - (-15)) \times 2.5)$ [Severe Deficit]

2. **Resting Heart Rate Sub-score**:
   - $\Delta \text{RHR} \le -1\,\text{bpm}$: $\min(100, 90 + |\Delta - (-1)| \times 3.0)$ [Optimal]
   - $-1 < \Delta \text{RHR} \le 2\,\text{bpm}$: $90 - \frac{\Delta - (-1)}{3} \times 15$ [Normal]
   - $2 < \Delta \text{RHR} \le 5\,\text{bpm}$: $75 - \frac{\Delta - 2}{3} \times 25$ [Mildly Elevated]
   - $\Delta \text{RHR} > 5\,\text{bpm}$: $\max(0, 50 - (\Delta - 5) \times 5.0)$ [Elevated]

3. **Sleep Duration Sub-score**:
   - $\Delta \text{Sleep} \ge +0.5\,\text{h}$: $\min(100, 90 + (\Delta - 0.5) \times 10.0)$ [Surplus]
   - $-0.5\,\text{h} \le \Delta \text{Sleep} < +0.5\,\text{h}$: $75 + \frac{\Delta - (-0.5)}{1.0} \times 15$ [Normal]
   - $-1.5\,\text{h} \le \Delta \text{Sleep} < -0.5\,\text{h}$: $50 + \frac{\Delta - (-1.5)}{1.0} \times 25$ [Mild Deficit]
   - $\Delta \text{Sleep} < -1.5\,\text{h}$: $\max(0, 50 + (\Delta - (-1.5)) \times 25.0)$ [Deficit]

4. **Activity Load Sub-score**:
   - `low`: $100$
   - `moderate`: $95$
   - `high`: $85$

### 5.2 Composite Readiness Score
$$\text{Composite} = (\text{HRV}_{\text{sub}} \times 0.40) + (\text{RHR}_{\text{sub}} \times 0.30) + (\text{Sleep}_{\text{sub}} \times 0.20) + (\text{Load}_{\text{sub}} \times 0.10)$$
Clamped strictly to $[0.0, 100.0]$ and rounded to 1 decimal place.

### 5.3 Status Classification Cutoffs
- **$\text{Score} \ge 75.0$**: `PUSH`
- **$50.0 \le \text{Score} < 75.0$**: `MODERATE`
- **$\text{Score} < 50.0$**: `RECOVER`

---

## 6. Output Contract

```typescript
export interface RecoveryFactor {
  metric: "hrv" | "resting_hr" | "sleep" | "activity_load";
  label: string;
  currentValue: number | string;
  baselineValue?: number | string;
  deviation: string; // e.g., "+6% vs baseline", "-2 bpm vs baseline"
  sentiment: "positive" | "neutral" | "negative";
  description: string;
}

export interface RecoveryDecision {
  status: "PUSH" | "MODERATE" | "RECOVER";
  score: number; // 0 - 100, 1 decimal place
  title: string;
  body: string;
  action: string;
  reason: string; // Concise factual reason synthesis
  baselineStatus: "learning" | "established";
  factors: RecoveryFactor[];
  calculatedAt: string; // ISO 8601 timestamp
}
```

---

## 7. Centralized Copy Mappings

### PUSH (Score $\ge$ 75)
- **Title**: *"You're in a great spot today"*
- **Body**: *"Your key recovery markers are close to or exceeding your recent baseline."*
- **Action**: *"Your body is responding well. A normal or high-intensity training day is well-supported if you feel ready."*
- **Reason**: Factual synthesis of optimal markers vs rolling baseline.

### MODERATE (50 $\le$ Score $<$ 75)
- **Title**: *"Keep today moderate"*
- **Body**: *"Some of your recovery markers are slightly below your usual baseline range."*
- **Action**: *"Consider keeping intensity steady and moderate. Listen to your body and adjust if fatigue sets in."*
- **Reason**: Factual synthesis highlighting mild deficit or baseline-adjacent values.

### RECOVER (Score $<$ 50)
- **Title**: *"Prioritize rest and recovery today"*
- **Body**: *"Multiple recovery markers indicate accumulated physical or physiological strain."*
- **Action**: *"Consider an easy recovery walk, mobility work, or an active rest day to recharge your system."*
- **Reason**: Factual synthesis highlighting suppressed markers and strain.

### Learning Baseline Fallback
- **Title**: *"Recovery data logged"*
- **Body**: *"We're still learning your normal baseline range."*
- **Action**: *"Add a few more days of data to establish your personalized baseline."*
- **Reason**: *"Recovery metrics logged. Your baseline is currently learning from recent data."*

---

## 8. Test Scenarios Matrix

Unit tests in `src/domain/recovery/__tests__/` must cover:
1. **Ideal Recovery Scenario**: Current HRV +10%, RHR -2 bpm, Sleep +45m, Low load $\rightarrow$ Status: `PUSH`, Score $\ge 85$.
2. **Moderate Mixed Scenario**: Current HRV -8%, RHR +2 bpm, Sleep within 15m, Moderate load $\rightarrow$ Status: `MODERATE`, Score between 55 and 70.
3. **Suppressed Strain Scenario**: Current HRV -25%, RHR +8 bpm, Sleep -2h, High load $\rightarrow$ Status: `RECOVER`, Score $< 40$.
4. **Boundary Scores**: Tests for exact cutoff scores (50.0, 74.9, 75.0).
5. **Learning Baseline Fallback**: Handling when $N = 0, 1, 2$ with missing baselines.
6. **Robustness / Clamping**: Out-of-bounds metrics (e.g. HRV 0, negative sleep hours) must be clamped or rejected before scoring.
