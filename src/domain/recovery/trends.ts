import { DailyMetricRow, RecommendationRow, RecoveryStatusType } from "@/types/database";
import { calculateBaseline } from "./baseline";
import { formatSleepDuration } from "@/lib/date";
import { BaselineStatus } from "./types";

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon", "Tue"
  shortDate: string; // e.g. "9/21"
  value: number | null;
  formattedValue: string;
}

export type TrendDirection = "improving" | "stable" | "declining" | "insufficient_data";

export interface MetricTrendSummary {
  metric: "hrv" | "resting_hr" | "sleep";
  label: string;
  unit: string;
  points: TrendDataPoint[];
  average: number | null;
  formattedAverage: string;
  baseline: number | null;
  formattedBaseline: string;
  baselineStatus: BaselineStatus;
  trendDirection: TrendDirection;
  minValue: number;
  maxValue: number;
}

export interface StatusDistribution {
  push: number;
  moderate: number;
  recover: number;
  total: number;
}

export interface TrendsResult {
  hrv: MetricTrendSummary;
  restingHr: MetricTrendSummary;
  sleep: MetricTrendSummary;
  statusDistribution: StatusDistribution;
  entryCount: number;
  baselineStatus: BaselineStatus;
}

/**
 * Formats a short day label like "M", "Tu", "W" or "Mon" from YYYY-MM-DD.
 */
export function getDayOfWeekLabel(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return "";
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()] || "";
}

/**
 * Formats a short calendar date like "9/21" from YYYY-MM-DD.
 */
export function getShortCalendarDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}`;
}

/**
 * Calculates trend direction by comparing the latest values against earlier values in the window.
 */
export function calculateTrendDirection(
  points: TrendDataPoint[],
  metric: "hrv" | "resting_hr" | "sleep"
): TrendDirection {
  const validPoints = points.filter((p) => p.value !== null && !isNaN(p.value!));
  if (validPoints.length < 3) {
    return "insufficient_data";
  }

  // Split into first half and second half
  const mid = Math.floor(validPoints.length / 2);
  const firstHalf = validPoints.slice(0, mid);
  const secondHalf = validPoints.slice(mid);

  const firstAvg = firstHalf.reduce((sum, p) => sum + (p.value || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + (p.value || 0), 0) / secondHalf.length;

  const diffPct = ((secondAvg - firstAvg) / firstAvg) * 100;

  // For HRV and Sleep: higher is improving, lower is declining
  // For Resting HR: lower is improving, higher is declining
  if (metric === "hrv") {
    if (diffPct > 3) return "improving";
    if (diffPct < -3) return "declining";
    return "stable";
  } else if (metric === "sleep") {
    const diffHours = secondAvg - firstAvg;
    if (diffHours > 0.4) return "improving";
    if (diffHours < -0.4) return "declining";
    return "stable";
  } else {
    // Resting HR
    if (diffPct < -2) return "improving";
    if (diffPct > 2) return "declining";
    return "stable";
  }
}

/**
 * Pure function to calculate comprehensive trends over a 7-day chronological window.
 *
 * @param entries Historical metric rows (can be unsorted or sorted).
 * @param recommendations Historical recommendation rows for status distribution.
 * @param referenceDate Optional reference anchor date (defaults to latest entry date or today).
 * @param windowDays Number of days for the trend chart (defaults to 7).
 */
export function calculateTrends(
  entries: DailyMetricRow[],
  recommendations: RecommendationRow[] = [],
  referenceDate?: string,
  windowDays = 7
): TrendsResult {
  // If no entries at all
  if (!entries || entries.length === 0) {
    const emptySummary = (
      metric: "hrv" | "resting_hr" | "sleep",
      label: string,
      unit: string
    ): MetricTrendSummary => ({
      metric,
      label,
      unit,
      points: [],
      average: null,
      formattedAverage: "—",
      baseline: null,
      formattedBaseline: "—",
      baselineStatus: "learning",
      trendDirection: "insufficient_data",
      minValue: 0,
      maxValue: 100,
    });

    return {
      hrv: emptySummary("hrv", "Heart Rate Variability", "ms"),
      restingHr: emptySummary("resting_hr", "Resting Heart Rate", "bpm"),
      sleep: emptySummary("sleep", "Sleep Duration", "hrs"),
      statusDistribution: { push: 0, moderate: 0, recover: 0, total: 0 },
      entryCount: 0,
      baselineStatus: "learning",
    };
  }

  // Filter entries strictly prior to referenceDate for baseline calculation
  // (ensures Trends baseline perfectly matches TodayScreen baseline)
  const priorEntries = referenceDate
    ? entries.filter((e) => e.date < referenceDate)
    : entries.slice(0, -1);

  const baselineResult = calculateBaseline(priorEntries, {
    referenceDate,
    windowDays: 14,
    minObservations: 2,
  });

  // Sort entries chronologically ASCENDING (oldest to newest)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Take the most recent `windowDays` entries
  const windowEntries = sortedEntries.slice(-windowDays);

  // 1. HRV Trend Points
  const hrvPoints: TrendDataPoint[] = windowEntries.map((e) => ({
    date: e.date,
    dayLabel: getDayOfWeekLabel(e.date),
    shortDate: getShortCalendarDate(e.date),
    value: e.hrv > 0 ? e.hrv : null,
    formattedValue: e.hrv > 0 ? `${Math.round(e.hrv)} ms` : "—",
  }));

  const validHrv = hrvPoints.filter((p) => p.value !== null).map((p) => p.value as number);
  const hrvAvg =
    validHrv.length > 0 ? Math.round(validHrv.reduce((a, b) => a + b, 0) / validHrv.length) : null;
  const hrvMin = validHrv.length > 0 ? Math.min(...validHrv, baselineResult.hrvBaseline || Infinity) : 0;
  const hrvMax = validHrv.length > 0 ? Math.max(...validHrv, baselineResult.hrvBaseline || 0) : 100;

  const hrvTrend: MetricTrendSummary = {
    metric: "hrv",
    label: "Heart Rate Variability",
    unit: "ms",
    points: hrvPoints,
    average: hrvAvg,
    formattedAverage: hrvAvg !== null ? `${hrvAvg} ms` : "—",
    baseline: baselineResult.hrvBaseline,
    formattedBaseline:
      baselineResult.hrvBaseline !== null
        ? `${Math.round(baselineResult.hrvBaseline)} ms`
        : "Learning",
    baselineStatus: baselineResult.status,
    trendDirection: calculateTrendDirection(hrrvDirectionPoints(hrvPoints), "hrv"),
    minValue: Math.max(0, Math.floor(hrvMin * 0.85)),
    maxValue: Math.ceil(hrvMax * 1.15),
  };

  // 2. Resting HR Trend Points
  const rhrPoints: TrendDataPoint[] = windowEntries.map((e) => ({
    date: e.date,
    dayLabel: getDayOfWeekLabel(e.date),
    shortDate: getShortCalendarDate(e.date),
    value: e.resting_hr > 0 ? e.resting_hr : null,
    formattedValue: e.resting_hr > 0 ? `${Math.round(e.resting_hr)} bpm` : "—",
  }));

  const validRhr = rhrPoints.filter((p) => p.value !== null).map((p) => p.value as number);
  const rhrAvg =
    validRhr.length > 0 ? Math.round(validRhr.reduce((a, b) => a + b, 0) / validRhr.length) : null;
  const rhrMin = validRhr.length > 0 ? Math.min(...validRhr, baselineResult.restingHrBaseline || Infinity) : 40;
  const rhrMax = validRhr.length > 0 ? Math.max(...validRhr, baselineResult.restingHrBaseline || 0) : 100;

  const restingHrTrend: MetricTrendSummary = {
    metric: "resting_hr",
    label: "Resting Heart Rate",
    unit: "bpm",
    points: rhrPoints,
    average: rhrAvg,
    formattedAverage: rhrAvg !== null ? `${rhrAvg} bpm` : "—",
    baseline: baselineResult.restingHrBaseline,
    formattedBaseline:
      baselineResult.restingHrBaseline !== null
        ? `${Math.round(baselineResult.restingHrBaseline)} bpm`
        : "Learning",
    baselineStatus: baselineResult.status,
    trendDirection: calculateTrendDirection(rhrPoints, "resting_hr"),
    minValue: Math.max(30, Math.floor(rhrMin * 0.9)),
    maxValue: Math.ceil(rhrMax * 1.1),
  };

  // 3. Sleep Trend Points
  const sleepPoints: TrendDataPoint[] = windowEntries.map((e) => ({
    date: e.date,
    dayLabel: getDayOfWeekLabel(e.date),
    shortDate: getShortCalendarDate(e.date),
    value: e.sleep_hours > 0 ? e.sleep_hours : null,
    formattedValue: e.sleep_hours > 0 ? formatSleepDuration(e.sleep_hours) : "—",
  }));

  const validSleep = sleepPoints.filter((p) => p.value !== null).map((p) => p.value as number);
  const sleepAvg =
    validSleep.length > 0
      ? Math.round((validSleep.reduce((a, b) => a + b, 0) / validSleep.length) * 10) / 10
      : null;
  const sleepMin = validSleep.length > 0 ? Math.min(...validSleep, baselineResult.sleepBaseline || Infinity) : 4;
  const sleepMax = validSleep.length > 0 ? Math.max(...validSleep, baselineResult.sleepBaseline || 0) : 10;

  const sleepTrend: MetricTrendSummary = {
    metric: "sleep",
    label: "Sleep Duration",
    unit: "hrs",
    points: sleepPoints,
    average: sleepAvg,
    formattedAverage: sleepAvg !== null ? formatSleepDuration(sleepAvg) : "—",
    baseline: baselineResult.sleepBaseline,
    formattedBaseline:
      baselineResult.sleepBaseline !== null
        ? formatSleepDuration(baselineResult.sleepBaseline)
        : "Learning",
    baselineStatus: baselineResult.status,
    trendDirection: calculateTrendDirection(sleepPoints, "sleep"),
    minValue: Math.max(0, Math.floor(sleepMin - 1)),
    maxValue: Math.ceil(sleepMax + 1),
  };

  // 4. Status distribution from recommendations
  let pushCount = 0;
  let moderateCount = 0;
  let recoverCount = 0;

  const windowDates = new Set(windowEntries.map((e) => e.date));
  for (const rec of recommendations) {
    if (windowDates.has(rec.date)) {
      if (rec.status === "PUSH") pushCount++;
      else if (rec.status === "MODERATE") moderateCount++;
      else if (rec.status === "RECOVER") recoverCount++;
    }
  }

  return {
    hrv: hrvTrend,
    restingHr: restingHrTrend,
    sleep: sleepTrend,
    statusDistribution: {
      push: pushCount,
      moderate: moderateCount,
      recover: recoverCount,
      total: pushCount + moderateCount + recoverCount,
    },
    entryCount: entries.length,
    baselineStatus: baselineResult.status,
  };
}

function hrrvDirectionPoints(points: TrendDataPoint[]): TrendDataPoint[] {
  return points;
}
