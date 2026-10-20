/**
 * Recovery Desk — Deterministic Recovery Scoring Engine
 * 
 * IMPORTANT:
 * All weights, thresholds, and formulas are product experimentation hypotheses
 * for wellness decision-support. They are NOT clinically validated medical diagnostic
 * thresholds and must never be presented as medical advice.
 * 
 * Rules:
 * - Pure function: Zero database code, zero React dependencies, zero AI.
 * - Deterministic and testable.
 * - Non-diagnostic, calm copy.
 * - Robust handling of zero, negative, or invalid values.
 */

import { RECOVERY_CONFIG } from "./config";
import {
  RecoveryInput,
  RecoveryDecision,
  RecoveryFactor,
  BaselineStatus,
} from "./types";
import { formatSleepDuration } from "@/lib/date";

/**
 * Clamps a number between a minimum and maximum bound.
 */

function formatSleepDelta(deviationHours: number): string {
  const sign = deviationHours >= 0 ? "+" : "-";
  const totalMinutes = Math.round(Math.abs(deviationHours) * 60);
  if (totalMinutes === 0) return "At your baseline";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) {
    return `${sign}${hours}h ${mins}m vs your baseline`;
  } else if (hours > 0) {
    return `${sign}${hours}h vs your baseline`;
  } else {
    return `${sign}${mins}m vs your baseline`;
  }
}

function clamp(val: number, min: number, max: number): number {
  if (isNaN(val) || !isFinite(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Computes HRV sub-score (0 - 100) based on deviation from baseline.
 */
export function calculateHrvSubscore(
  hrv: number,
  baseline?: number
): { score: number; deviationPct?: number; sentiment: "positive" | "neutral" | "negative" } {
  const safeHrv = clamp(hrv, 0, 300);

  if (safeHrv === 0) {
    return { score: 0, sentiment: "negative" };
  }

  // Fallback when baseline is not established
  if (!baseline || baseline <= 0 || isNaN(baseline)) {
    if (safeHrv >= 65) return { score: 85, sentiment: "positive" };
    if (safeHrv >= 45) return { score: 75, sentiment: "neutral" };
    if (safeHrv >= 25) return { score: 60, sentiment: "neutral" };
    return { score: 40, sentiment: "negative" };
  }

  const deviationPct = ((safeHrv - baseline) / baseline) * 100;
  const roundedDev = Math.round(deviationPct * 10) / 10;

  let score: number;
  let sentiment: "positive" | "neutral" | "negative";

  if (deviationPct >= RECOVERY_CONFIG.hrv.excellent) {
    // >= +5% deviation: Excellent (90 - 100)
    score = Math.min(100, 90 + (deviationPct - 5) * 1.0);
    sentiment = "positive";
  } else if (deviationPct >= RECOVERY_CONFIG.hrv.normal) {
    // -5% to +5% deviation: Normal range (75 - 90)
    score = 75 + ((deviationPct - (-5)) / 10) * 15;
    sentiment = deviationPct >= 0 ? "positive" : "neutral";
  } else if (deviationPct >= RECOVERY_CONFIG.hrv.mildDeficit) {
    // -15% to -5% deviation: Mild deficit (50 - 75)
    score = 50 + ((deviationPct - (-15)) / 10) * 25;
    sentiment = "negative";
  } else {
    // < -15% deviation: Severe deficit (0 - 50)
    score = Math.max(0, 50 + (deviationPct - (-15)) * 2.5);
    sentiment = "negative";
  }

  return {
    score: clamp(Math.round(score * 10) / 10, 0, 100),
    deviationPct: roundedDev,
    sentiment,
  };
}

/**
 * Computes Resting Heart Rate sub-score (0 - 100).
 * Lower or baseline is positive; elevated is negative.
 */
export function calculateRhrSubscore(
  rhr: number,
  baseline?: number
): { score: number; deviationBpm?: number; sentiment: "positive" | "neutral" | "negative" } {
  const safeRhr = clamp(rhr, 0, 220);

  if (safeRhr === 0) {
    return { score: 0, sentiment: "negative" };
  }

  // Absolute Tachycardia & Elevated Strain Guards:
  // Regardless of relative baseline deviation, resting pulse >= 100 bpm is tachycardia,
  // and >= 85 bpm indicates acute physiological distress/illness.
  if (safeRhr >= 100) {
    return {
      score: clamp(Math.round(25 - (safeRhr - 100) * 1.5), 0, 25),
      deviationBpm: baseline ? Math.round((safeRhr - baseline) * 10) / 10 : undefined,
      sentiment: "negative",
    };
  }

  if (safeRhr >= 85) {
    return {
      score: clamp(Math.round(45 - (safeRhr - 85) * 1.3), 25, 45),
      deviationBpm: baseline ? Math.round((safeRhr - baseline) * 10) / 10 : undefined,
      sentiment: "negative",
    };
  }

  // Fallback when baseline is not established (<2 observations)
  if (!baseline || baseline <= 0 || isNaN(baseline)) {
    if (safeRhr <= 50) return { score: 90, sentiment: "positive" };
    if (safeRhr <= 58) return { score: 80, sentiment: "positive" };
    if (safeRhr <= 68) return { score: 70, sentiment: "neutral" };
    return { score: 55, sentiment: "neutral" };
  }

  const deviationBpm = safeRhr - baseline;
  const roundedDev = Math.round(deviationBpm * 10) / 10;

  let score: number;
  let sentiment: "positive" | "neutral" | "negative";

  if (deviationBpm <= RECOVERY_CONFIG.rhr.optimal) {
    // <= -1 bpm below baseline: Optimal (90 - 100)
    score = Math.min(100, 90 + Math.abs(deviationBpm - (-1)) * 3.0);
    sentiment = "positive";
  } else if (deviationBpm <= RECOVERY_CONFIG.rhr.normal) {
    // -1 to +2 bpm above baseline: Normal range (75 - 90)
    score = 90 - ((deviationBpm - (-1)) / 3) * 15;
    sentiment = deviationBpm <= 0 ? "positive" : "neutral";
  } else if (deviationBpm <= RECOVERY_CONFIG.rhr.mildElevated) {
    // +2 to +5 bpm above baseline: Mildly elevated (50 - 75)
    score = 75 - ((deviationBpm - 2) / 3) * 25;
    sentiment = "negative";
  } else {
    // > +5 bpm above baseline: Elevated (0 - 50)
    score = Math.max(0, 50 - (deviationBpm - 5) * 5.0);
    sentiment = "negative";
  }

  return {
    score: clamp(Math.round(score * 10) / 10, 0, 100),
    deviationBpm: roundedDev,
    sentiment,
  };
}

export function calculateSleepSubscore(
  sleepHours: number,
  baseline?: number
): { score: number; deviationHours?: number; sentiment: "positive" | "neutral" | "negative" } {
  const safeSleep = clamp(sleepHours, 0, 24);

  if (safeSleep === 0) {
    return { score: 0, sentiment: "negative" };
  }

  // Fallback when baseline is not established
  if (!baseline || baseline <= 0 || isNaN(baseline)) {
    if (safeSleep >= 8.0) return { score: 85, sentiment: "positive" };
    if (safeSleep >= 7.0) return { score: 75, sentiment: "neutral" };
    if (safeSleep >= 6.0) return { score: 60, sentiment: "neutral" };
    return { score: 40, sentiment: "negative" };
  }

  const deviationHours = safeSleep - baseline;
  const roundedDev = Math.round(deviationHours * 100) / 100;

  let score: number;
  let sentiment: "positive" | "neutral" | "negative";

  if (deviationHours >= RECOVERY_CONFIG.sleep.surplus) {
    // >= +0.5h over baseline: Surplus (90 - 100)
    score = Math.min(100, 90 + (deviationHours - 0.5) * 10.0);
    sentiment = "positive";
  } else if (deviationHours >= RECOVERY_CONFIG.sleep.normal) {
    // -0.5h to +0.5h: Normal range (75 - 90)
    score = 75 + ((deviationHours - (-0.5)) / 1.0) * 15;
    sentiment = deviationHours >= 0 ? "positive" : "neutral";
  } else if (deviationHours >= RECOVERY_CONFIG.sleep.mildDeficit) {
    // -1.5h to -0.5h: Mild deficit (50 - 75)
    score = 50 + ((deviationHours - (-1.5)) / 1.0) * 25;
    sentiment = "negative";
  } else {
    // < -1.5h: Severe deficit (0 - 50)
    score = Math.max(0, 50 + (deviationHours - (-1.5)) * 25.0);
    sentiment = "negative";
  }

  return {
    score: clamp(Math.round(score * 10) / 10, 0, 100),
    deviationHours: roundedDev,
    sentiment,
  };
}

/**
 * Computes Activity Load sub-score (0 - 100).
 */
export function calculateActivityLoadSubscore(
  load: string
): { score: number; sentiment: "positive" | "neutral" | "negative" } {
  const normalized = (load || "").toLowerCase().trim();

  switch (normalized) {
    case "low":
      return { score: 100 - RECOVERY_CONFIG.activityLoadPenalty.low, sentiment: "positive" };
    case "moderate":
      return { score: 100 - RECOVERY_CONFIG.activityLoadPenalty.moderate, sentiment: "neutral" };
    case "high":
      return { score: 100 - RECOVERY_CONFIG.activityLoadPenalty.high, sentiment: "negative" };
    default:
      return { score: 80, sentiment: "neutral" };
  }
}

/**
 * Builds a concise, factual 1-sentence reason summarizing the decision.
 */
function buildFactualReason(
  status: "PUSH" | "MODERATE" | "RECOVER",
  baselineStatus: BaselineStatus,
  hrvInfo: { deviationPct?: number; sentiment: string },
  rhrInfo: { deviationBpm?: number; sentiment: string },
  sleepInfo: { deviationHours?: number; sentiment: string },
  activityLoad: string
): string {
  if (baselineStatus === "learning") {
    return "Recovery metrics logged. Your baseline is currently learning from recent data.";
  }

  const hrvStr =
    hrvInfo.deviationPct !== undefined
      ? `HRV (${hrvInfo.deviationPct >= 0 ? "+" : ""}${hrvInfo.deviationPct}%)`
      : "HRV";

  const rhrStr =
    rhrInfo.deviationBpm !== undefined
      ? `resting HR (${rhrInfo.deviationBpm >= 0 ? "+" : ""}${rhrInfo.deviationBpm} bpm)`
      : "resting HR";

  const loadStr = activityLoad.toLowerCase();

  switch (status) {
    case "PUSH":
      return `Your ${hrvStr} and ${rhrStr} are in optimal ranges following ${loadStr} activity load.`;
    case "MODERATE":
      return `Your recovery markers are close to your rolling baseline with ${loadStr} physical load.`;
    case "RECOVER":
      return `Your ${hrvStr} and ${rhrStr} indicate elevated fatigue following ${loadStr} load.`;
  }
}

/**
 * Pure function: Calculates recovery score, classification, contributing factors,
 * and concise factual rationale.
 */
export function calculateRecoveryDecision(
  input: RecoveryInput
): RecoveryDecision {
  const isBaselineEstablished =
    Boolean(input.hrvBaseline && input.hrvBaseline > 0) &&
    Boolean(input.restingHrBaseline && input.restingHrBaseline > 0) &&
    Boolean(input.sleepBaseline && input.sleepBaseline > 0);

  const baselineStatus: BaselineStatus = isBaselineEstablished
    ? "established"
    : "learning";

  // Compute subscores
  const hrvRes = calculateHrvSubscore(input.hrv, input.hrvBaseline);
  const rhrRes = calculateRhrSubscore(input.restingHr, input.restingHrBaseline);
  const sleepRes = calculateSleepSubscore(input.sleepHours, input.sleepBaseline);
  const loadRes = calculateActivityLoadSubscore(input.activityLoad);

  // Compute weighted composite score (0 - 100)
  const composite =
    hrvRes.score * RECOVERY_CONFIG.weights.hrv +
    rhrRes.score * RECOVERY_CONFIG.weights.rhr +
    sleepRes.score * RECOVERY_CONFIG.weights.sleep +
    loadRes.score * RECOVERY_CONFIG.weights.activityLoad;

  let score = clamp(Math.round(composite * 10) / 10, 0, 100);

  // Critical Physiological Guard: Resting Tachycardia override
  // If resting pulse >= 100 bpm, acute physiological strain is present.
  // Overall recovery cannot exceed 55 (strictly non-optimal).
  if (input.restingHr >= 100) {
    score = Math.min(score, 55);
  }

  // Determine recovery status
  let status: "PUSH" | "MODERATE" | "RECOVER";
  if (score >= RECOVERY_CONFIG.statusThresholds.push) {
    status = "PUSH";
  } else if (score >= RECOVERY_CONFIG.statusThresholds.moderate) {
    status = "MODERATE";
  } else {
    status = "RECOVER";
  }

  // Select copy templates
  const copyKey =
    baselineStatus === "learning"
      ? "learning"
      : status === "PUSH"
      ? "push"
      : status === "MODERATE"
      ? "moderate"
      : "recover";

  const copy = RECOVERY_CONFIG.copy[copyKey];
  const userGoal = input.goal || "training";
  const selectedPlan =
    copy.plans && (copy.plans as Record<string, any>)[userGoal]
      ? (copy.plans as Record<string, any>)[userGoal]
      : copy.plan;

  // Generate contributing factors
  const factors: RecoveryFactor[] = [
    {
      metric: "hrv",
      label: "HRV",
      currentValue: `${Math.round(clamp(input.hrv, 0, 300))} ms`,
      baselineValue: input.hrvBaseline ? `${Math.round(input.hrvBaseline)} ms` : undefined,
      deviation:
        hrvRes.deviationPct !== undefined
          ? `${hrvRes.deviationPct >= 0 ? "+" : ""}${hrvRes.deviationPct}% vs your baseline`
          : "Learning baseline",
      sentiment: hrvRes.sentiment,
      impactLabel: hrvRes.sentiment === "positive" ? "↑ Helped" : hrvRes.sentiment === "neutral" ? "→ At baseline" : "↓ Held back",
      description:
        hrvRes.sentiment === "positive"
          ? "HRV is elevated today — your nervous system shows strong recovery."
          : hrvRes.sentiment === "neutral"
          ? "HRV is right in your normal baseline range."
          : "HRV is running low today, showing your body is still absorbing recent strain.",
    },
    {
      metric: "resting_hr",
      label: "Resting HR",
      currentValue: `${Math.round(clamp(input.restingHr, 0, 220))} bpm`,
      baselineValue: input.restingHrBaseline ? `${Math.round(input.restingHrBaseline)} bpm` : undefined,
      deviation:
        rhrRes.deviationBpm !== undefined
          ? `${rhrRes.deviationBpm >= 0 ? "+" : ""}${rhrRes.deviationBpm} bpm vs your baseline`
          : "Learning baseline",
      sentiment: rhrRes.sentiment,
      impactLabel: rhrRes.sentiment === "positive" ? "↑ Helped" : rhrRes.sentiment === "neutral" ? "→ At baseline" : "↓ Held back",
      description:
        rhrRes.sentiment === "positive"
          ? "Resting heart rate is calm and well-recovered."
          : rhrRes.sentiment === "neutral"
          ? "Resting heart rate is holding steady at your normal baseline."
          : "Resting pulse is slightly elevated as your body works to recharge.",
    },
    {
      metric: "sleep",
      label: "Sleep",
      currentValue: formatSleepDuration(clamp(input.sleepHours, 0, 24)),
      baselineValue: input.sleepBaseline ? formatSleepDuration(input.sleepBaseline) : undefined,
      deviation:
        sleepRes.deviationHours !== undefined
          ? formatSleepDelta(sleepRes.deviationHours)
          : "Learning baseline",
      sentiment: sleepRes.sentiment,
      impactLabel: sleepRes.sentiment === "positive" ? "↑ Helped" : sleepRes.sentiment === "neutral" ? "→ At baseline" : "↓ Held back",
      description:
        sleepRes.sentiment === "positive"
          ? "Solid sleep duration gave your body ample time to reset."
          : sleepRes.sentiment === "neutral"
          ? "Sleep duration matched your regular baseline window."
          : "You slept less than your body usually needs, leaving less recovery time.",
    },
    {
      metric: "activity_load",
      label: "Activity Load",
      currentValue:
        (input.activityLoad || "moderate").charAt(0).toUpperCase() +
        (input.activityLoad || "moderate").slice(1),
      deviation: "Yesterday's physical load",
      sentiment: loadRes.sentiment,
      impactLabel: loadRes.sentiment === "positive" ? "↑ Helped" : loadRes.sentiment === "neutral" ? "→ Balanced" : "↓ Held back",
      description:
        input.activityLoad === "low"
          ? "Light activity yesterday left plenty of fuel in the tank."
          : input.activityLoad === "moderate"
          ? "Yesterday's physical load was balanced and steady."
          : "A heavy physical load yesterday put significant demand on your system.",
    },
  ];

  
  const hrvPts = Math.round(hrvRes.score * RECOVERY_CONFIG.weights.hrv);
  const rhrPts = Math.round(rhrRes.score * RECOVERY_CONFIG.weights.rhr);
  const sleepPts = Math.round(sleepRes.score * RECOVERY_CONFIG.weights.sleep);
  const loadPts = Math.round(loadRes.score * RECOVERY_CONFIG.weights.activityLoad);

  const pointsBreakdown = {
    hrv: hrvPts,
    restingHr: rhrPts,
    sleep: sleepPts,
    activityLoad: loadPts,
    total: Math.round(score),
  };

  const readinessTier =
    baselineStatus === "learning"
      ? "Establishing Baseline"
      : status === "PUSH"
      ? "Prime Readiness (85–100)"
      : status === "MODERATE"
      ? "Moderate Readiness (60–84)"
      : "Recovery Priority (0–59)";

  const reason = buildFactualReason(
    status,
    baselineStatus,
    hrvRes,
    rhrRes,
    sleepRes,
    input.activityLoad
  );

  return {
    status,
    score,
    title: copy.title,
    body: copy.body,
    action: copy.action,
    plan: selectedPlan,
    readinessTier,
    pointsBreakdown,
    reason,
    baselineStatus,
    factors,
    calculatedAt: new Date().toISOString(),
  };
}
