/**
 * Recovery Desk — Pure Baseline Calculation Engine
 * 
 * Computes individual rolling baselines for HRV, resting heart rate, and sleep duration.
 * Adheres strictly to the principle of not pretending a baseline is reliable
 * until sufficient valid observations exist in the recent historical window.
 */

import { RECOVERY_CONFIG } from "./config";
import { BaselineCalculationResult, BaselineStatus, MetricCounts } from "./types";

export interface HistoricalMetricInput {
  date: string; // YYYY-MM-DD
  hrv?: number | null;
  resting_hr?: number | null;
  sleep_hours?: number | null;
  sleep_score?: number | null;
  activity_load?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BaselineOptions {
  referenceDate?: string; // YYYY-MM-DD anchor date; defaults to most recent entry date
  windowDays?: number; // Rolling window size in days; defaults to 14
  minObservations?: number; // Minimum required observations; defaults to 3
  allowProvisional?: boolean; // If true, returns provisional mean even when status is 'learning'
}

/**
 * Checks whether an HRV value is clinically/physiologically valid and within bounds.
 * Boundary: 0 < HRV <= 300 ms.
 */
export function isHrvValid(val: unknown): boolean {
  if (typeof val !== "number" || isNaN(val) || !isFinite(val)) return false;
  return val > 0 && val <= 300;
}

/**
 * Checks whether a resting heart rate value is valid and within bounds.
 * Boundary: 30 <= RHR <= 220 bpm.
 */
export function isRestingHrValid(val: unknown): boolean {
  if (typeof val !== "number" || isNaN(val) || !isFinite(val)) return false;
  return val >= 30 && val <= 220;
}

/**
 * Checks whether a sleep duration value is valid and within bounds.
 * Boundary: 0 < Sleep <= 24 hours.
 */
export function isSleepValid(val: unknown): boolean {
  if (typeof val !== "number" || isNaN(val) || !isFinite(val)) return false;
  return val > 0 && val <= 24;
}

/**
 * Computes the arithmetic mean of an array of numbers, rounded to specified decimals.
 */
export function calculateMetricAverage(
  values: number[],
  decimals: number = 1
): number | null {
  if (!values || values.length === 0) return null;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const factor = Math.pow(10, decimals);
  return Math.round((sum / values.length) * factor) / factor;
}

/**
 * Parses YYYY-MM-DD into a UTC midnight timestamp to avoid timezone skew.
 */
function parseDateToUtcMidnight(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * Deduplicates entries by date.
 * If multiple entries exist for the same date, prioritizes the latest `updated_at` / `created_at`,
 * or the first entry encountered.
 */
export function deduplicateEntries(
  entries: HistoricalMetricInput[]
): HistoricalMetricInput[] {
  const dateMap = new Map<string, HistoricalMetricInput>();

  for (const entry of entries) {
    if (!entry.date) continue;
    const existing = dateMap.get(entry.date);
    if (!existing) {
      dateMap.set(entry.date, entry);
    } else {
      // Prioritize entry with newer timestamp if available
      const existingTime = new Date(
        existing.updated_at || existing.created_at || 0
      ).getTime();
      const newTime = new Date(
        entry.updated_at || entry.created_at || 0
      ).getTime();

      if (newTime > existingTime) {
        dateMap.set(entry.date, entry);
      }
    }
  }

  return Array.from(dateMap.values());
}

/**
 * Filters deduplicated entries to those falling within the historical window:
 * [referenceDate - (windowDays - 1), referenceDate].
 * Entries with date > referenceDate are excluded.
 */
export function filterEntriesInWindow(
  entries: HistoricalMetricInput[],
  referenceDate: string,
  windowDays: number
): HistoricalMetricInput[] {
  const refTime = parseDateToUtcMidnight(referenceDate);
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  return entries.filter((entry) => {
    if (!entry.date) return false;
    const entryTime = parseDateToUtcMidnight(entry.date);
    // Entry cannot be in future relative to referenceDate
    if (entryTime > refTime) return false;
    // Entry must be within windowDays
    const diff = refTime - entryTime;
    return diff >= 0 && diff < windowMs;
  });
}

/**
 * Pure function: Calculates personal rolling baselines for HRV, resting heart rate,
 * and sleep duration from historical entries.
 * 
 * Rules:
 * 1. Filter corrupt/abnormal values per metric.
 * 2. Deduplicate same-date entries.
 * 3. Restrict observations to the configured rolling window (default 14 days).
 * 4. Require at least `minObservations` (default 3) valid points before establishing a metric baseline.
 * 5. Return status: "learning" when observations are insufficient, and "established" when ready.
 */
export function calculateBaseline(
  entries: HistoricalMetricInput[],
  options: BaselineOptions = {}
): BaselineCalculationResult {
  const windowDays = options.windowDays ?? RECOVERY_CONFIG.baselineWindowDays;
  const minObservations =
    options.minObservations ?? RECOVERY_CONFIG.minBaselineObservations;
  const allowProvisional = options.allowProvisional ?? false;

  if (!entries || entries.length === 0) {
    return {
      hrvBaseline: null,
      restingHrBaseline: null,
      sleepBaseline: null,
      dataCount: 0,
      status: "learning",
      metricCounts: { hrv: 0, restingHr: 0, sleep: 0 },
      provisional: {
        hrvBaseline: null,
        restingHrBaseline: null,
        sleepBaseline: null,
      },
    };
  }

  // 1. Deduplicate by date
  const deduplicated = deduplicateEntries(entries);

  // 2. Determine reference date (anchor)
  let referenceDate = options.referenceDate;
  if (!referenceDate) {
    // Pick the most recent valid date among deduplicated entries
    const sortedDates = deduplicated
      .map((e) => e.date)
      .sort((a, b) => b.localeCompare(a));
    referenceDate = sortedDates[0] || new Date().toISOString().slice(0, 10);
  }

  // 3. Filter entries within the historical window
  const windowEntries = filterEntriesInWindow(
    deduplicated,
    referenceDate,
    windowDays
  );

  // 4. Collect valid values per metric, ignoring abnormal/missing values
  const validHrv: number[] = [];
  const validRhr: number[] = [];
  const validSleep: number[] = [];
  let distinctValidDaysCount = 0;

  for (const entry of windowEntries) {
    let dayHasValidMetric = false;

    if (isHrvValid(entry.hrv)) {
      validHrv.push(entry.hrv as number);
      dayHasValidMetric = true;
    }

    if (isRestingHrValid(entry.resting_hr)) {
      validRhr.push(entry.resting_hr as number);
      dayHasValidMetric = true;
    }

    if (isSleepValid(entry.sleep_hours)) {
      validSleep.push(entry.sleep_hours as number);
      dayHasValidMetric = true;
    }

    if (dayHasValidMetric) {
      distinctValidDaysCount++;
    }
  }

  const metricCounts: MetricCounts = {
    hrv: validHrv.length,
    restingHr: validRhr.length,
    sleep: validSleep.length,
  };

  // 5. Compute arithmetic means
  const provisionalHrv = calculateMetricAverage(validHrv, 1);
  const provisionalRhr = calculateMetricAverage(validRhr, 1);
  const provisionalSleep = calculateMetricAverage(validSleep, 2);

  // 6. Evaluate baseline establishment
  // A metric baseline is established if it meets minObservations
  const isHrvEstablished = validHrv.length >= minObservations;
  const isRhrEstablished = validRhr.length >= minObservations;
  const isSleepEstablished = validSleep.length >= minObservations;

  // Global status is established when all 3 biomarkers have sufficient data points
  const overallStatus: BaselineStatus =
    isHrvEstablished && isRhrEstablished && isSleepEstablished
      ? "established"
      : "learning";

  // When not established, return null unless allowProvisional is explicitly enabled
  const hrvBaseline =
    isHrvEstablished || allowProvisional ? provisionalHrv : null;
  const restingHrBaseline =
    isRhrEstablished || allowProvisional ? provisionalRhr : null;
  const sleepBaseline =
    isSleepEstablished || allowProvisional ? provisionalSleep : null;

  return {
    hrvBaseline,
    restingHrBaseline,
    sleepBaseline,
    dataCount: distinctValidDaysCount,
    status: overallStatus,
    metricCounts,
    provisional: {
      hrvBaseline: provisionalHrv,
      restingHrBaseline: provisionalRhr,
      sleepBaseline: provisionalSleep,
    },
  };
}
