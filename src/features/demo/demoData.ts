import { DailyMetricRow, RecommendationRow } from "@/types/database";
import { DemoScenario } from "./DemoContext";
import { getTodayDateString } from "@/lib/date";

export function generateDemoMetrics(todayDate: string, currentScenario: DemoScenario): {
  metrics: DailyMetricRow[];
  recommendations: RecommendationRow[];
  todayMetric: DailyMetricRow;
} {
  const baseDate = new Date(todayDate);
  const metrics: DailyMetricRow[] = [];
  const recommendations: RecommendationRow[] = [];

  // Define 14 days of realistic background data (days 1 to 13 prior to today)
  const pastDays = [
    { offset: 1, hrv: 66, rhr: 51, sleep: 8.0, load: "moderate", status: "MODERATE", score: 80 },
    { offset: 2, hrv: 70, rhr: 49, sleep: 8.2, load: "low", status: "PUSH", score: 90 },
    { offset: 3, hrv: 63, rhr: 53, sleep: 7.4, load: "moderate", status: "MODERATE", score: 76 },
    { offset: 4, hrv: 68, rhr: 50, sleep: 8.0, load: "low", status: "PUSH", score: 88 },
    { offset: 5, hrv: 55, rhr: 58, sleep: 6.2, load: "high", status: "RECOVER", score: 48 },
    { offset: 6, hrv: 64, rhr: 52, sleep: 7.8, load: "moderate", status: "MODERATE", score: 79 },
    { offset: 7, hrv: 69, rhr: 50, sleep: 8.1, load: "low", status: "PUSH", score: 89 },
    { offset: 8, hrv: 65, rhr: 52, sleep: 7.9, load: "moderate", status: "MODERATE", score: 81 },
    { offset: 9, hrv: 62, rhr: 54, sleep: 7.3, load: "moderate", status: "MODERATE", score: 75 },
    { offset: 10, hrv: 71, rhr: 48, sleep: 8.4, load: "low", status: "PUSH", score: 92 },
    { offset: 11, hrv: 65, rhr: 52, sleep: 8.0, load: "moderate", status: "MODERATE", score: 82 },
    { offset: 12, hrv: 58, rhr: 56, sleep: 6.8, load: "high", status: "RECOVER", score: 55 },
    { offset: 13, hrv: 66, rhr: 51, sleep: 7.9, load: "moderate", status: "MODERATE", score: 83 },
  ];

  for (const item of pastDays) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - item.offset);
    const dateStr = getTodayDateString(d);

    const m: DailyMetricRow = {
      id: `demo-metric-${item.offset}`,
      user_id: "demo-user",
      date: dateStr,
      hrv: item.hrv,
      resting_hr: item.rhr,
      sleep_hours: item.sleep,
      sleep_score: 85,
      activity_load: item.load as "low" | "moderate" | "high",
      notes: "Demo historical entry",
      created_at: new Date(d).toISOString(),
      updated_at: new Date(d).toISOString(),
    };
    metrics.push(m);

    const r: RecommendationRow = {
      id: `demo-rec-${item.offset}`,
      user_id: "demo-user",
      date: dateStr,
      status: item.status as "PUSH" | "MODERATE" | "RECOVER",
      score: item.score,
      reason_data: null,
      created_at: new Date(d).toISOString(),
    };
    recommendations.push(r);
  }

  // Today's scenario metric
  let todayValues: {
    hrv: number;
    resting_hr: number;
    sleep_hours: number;
    activity_load: "low" | "moderate" | "high";
    notes: string;
    status: "PUSH" | "MODERATE" | "RECOVER";
    score: number;
  } = {
    hrv: 62,
    resting_hr: 53,
    sleep_hours: 7.5,
    activity_load: "moderate" as const,
    notes: "Normal day, mild physical fatigue.",
    status: "MODERATE" as const,
    score: 78,
  };

  if (currentScenario === "push") {
    todayValues = {
      hrv: 74,
      resting_hr: 48,
      sleep_hours: 8.5,
      activity_load: "low",
      notes: "Felt well-rested, early wind-down.",
      status: "PUSH",
      score: 92,
    };
  } else if (currentScenario === "recover") {
    todayValues = {
      hrv: 48,
      resting_hr: 62,
      sleep_hours: 5.5,
      activity_load: "high",
      notes: "Late night and demanding prior day strain.",
      status: "RECOVER",
      score: 42,
    };
  }

  const todayMetric: DailyMetricRow = {
    id: "demo-today-id",
    user_id: "demo-user",
    date: todayDate,
    hrv: todayValues.hrv,
    resting_hr: todayValues.resting_hr,
    sleep_hours: todayValues.sleep_hours,
    sleep_score: 85,
    activity_load: todayValues.activity_load,
    notes: todayValues.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  metrics.unshift(todayMetric);

  const todayRec: RecommendationRow = {
    id: "demo-today-rec",
    user_id: "demo-user",
    date: todayDate,
    status: todayValues.status,
    score: todayValues.score,
    reason_data: null,
    created_at: new Date().toISOString(),
  };
  recommendations.unshift(todayRec);

  return { metrics, recommendations, todayMetric };
}
