import { calculateTrends, calculateTrendDirection, getDayOfWeekLabel } from "../trends";
import { DailyMetricRow, RecommendationRow } from "@/types/database";

describe("Recovery Trends Domain Engine", () => {
  const sampleMetrics: DailyMetricRow[] = [
    {
      id: "1",
      user_id: "u1",
      date: "2026-09-15",
      hrv: 55,
      resting_hr: 62,
      sleep_hours: 7.0,
      sleep_score: null,
      activity_load: "high",
      notes: null,
      created_at: "2026-09-15T08:00:00Z",
      updated_at: "2026-09-15T08:00:00Z",
    },
    {
      id: "2",
      user_id: "u1",
      date: "2026-09-16",
      hrv: 58,
      resting_hr: 60,
      sleep_hours: 7.5,
      sleep_score: null,
      activity_load: "moderate",
      notes: null,
      created_at: "2026-09-16T08:00:00Z",
      updated_at: "2026-09-16T08:00:00Z",
    },
    {
      id: "3",
      user_id: "u1",
      date: "2026-09-17",
      hrv: 62,
      resting_hr: 58,
      sleep_hours: 8.0,
      sleep_score: null,
      activity_load: "low",
      notes: null,
      created_at: "2026-09-17T08:00:00Z",
      updated_at: "2026-09-17T08:00:00Z",
    },
    {
      id: "4",
      user_id: "u1",
      date: "2026-09-18",
      hrv: 65,
      resting_hr: 56,
      sleep_hours: 8.2,
      sleep_score: null,
      activity_load: "low",
      notes: null,
      created_at: "2026-09-18T08:00:00Z",
      updated_at: "2026-09-18T08:00:00Z",
    },
    {
      id: "5",
      user_id: "u1",
      date: "2026-09-19",
      hrv: 68,
      resting_hr: 55,
      sleep_hours: 8.5,
      sleep_score: null,
      activity_load: "moderate",
      notes: null,
      created_at: "2026-09-19T08:00:00Z",
      updated_at: "2026-09-19T08:00:00Z",
    },
  ];

  const sampleRecommendations: RecommendationRow[] = [
    {
      id: "r1",
      user_id: "u1",
      date: "2026-09-15",
      status: "RECOVER",
      score: 45,
      reason_data: {},
      created_at: "2026-09-15T08:00:00Z",
    },
    {
      id: "r2",
      user_id: "u1",
      date: "2026-09-16",
      status: "MODERATE",
      score: 65,
      reason_data: {},
      created_at: "2026-09-16T08:00:00Z",
    },
    {
      id: "r3",
      user_id: "u1",
      date: "2026-09-17",
      status: "PUSH",
      score: 82,
      reason_data: {},
      created_at: "2026-09-17T08:00:00Z",
    },
    {
      id: "r4",
      user_id: "u1",
      date: "2026-09-18",
      status: "PUSH",
      score: 88,
      reason_data: {},
      created_at: "2026-09-18T08:00:00Z",
    },
    {
      id: "r5",
      user_id: "u1",
      date: "2026-09-19",
      status: "PUSH",
      score: 90,
      reason_data: {},
      created_at: "2026-09-19T08:00:00Z",
    },
  ];

  describe("Empty history", () => {
    it("returns learning baseline status and empty points when given 0 entries", () => {
      const result = calculateTrends([]);
      expect(result.entryCount).toBe(0);
      expect(result.baselineStatus).toBe("learning");
      expect(result.hrv.points).toHaveLength(0);
      expect(result.hrv.average).toBeNull();
      expect(result.hrv.baseline).toBeNull();
      expect(result.hrv.formattedAverage).toBe("—");
      expect(result.hrv.formattedBaseline).toBe("—");
      expect(result.statusDistribution.total).toBe(0);
    });
  });

  describe("Partial history (< 3 observations)", () => {
    it("returns learning baseline status with partial points for 1 entry", () => {
      const result = calculateTrends([sampleMetrics[0]], [sampleRecommendations[0]]);
      expect(result.entryCount).toBe(1);
      expect(result.baselineStatus).toBe("learning");
      expect(result.hrv.points).toHaveLength(1);
      expect(result.hrv.points[0].value).toBe(55);
      expect(result.hrv.baseline).toBeNull();
      expect(result.hrv.formattedBaseline).toBe("Learning");
      expect(result.hrv.trendDirection).toBe("insufficient_data");
      expect(result.statusDistribution.recover).toBe(1);
      expect(result.statusDistribution.total).toBe(1);
    });

    it("returns learning baseline status with partial points for 2 entries", () => {
      const result = calculateTrends(sampleMetrics.slice(0, 2), sampleRecommendations.slice(0, 2));
      expect(result.entryCount).toBe(2);
      expect(result.baselineStatus).toBe("learning");
      expect(result.hrv.points).toHaveLength(2);
      expect(result.hrv.baseline).toBeNull();
      expect(result.restingHr.baseline).toBeNull();
      expect(result.sleep.baseline).toBeNull();
      expect(result.hrv.trendDirection).toBe("insufficient_data");
    });
  });

  describe("Full history (>= 3 observations)", () => {
    it("calculates established baselines, averages, and trend points correctly", () => {
      const result = calculateTrends(sampleMetrics, sampleRecommendations, "2026-09-19", 7);
      expect(result.entryCount).toBe(5);
      expect(result.baselineStatus).toBe("established");

      // HRV
      expect(result.hrv.points).toHaveLength(5);
      expect(result.hrv.baseline).not.toBeNull();
      expect(result.hrv.average).toBeGreaterThan(50);
      expect(result.hrv.formattedBaseline).toContain("ms");
      // HRV increased from 55 -> 68, should be improving
      expect(result.hrv.trendDirection).toBe("improving");

      // Resting HR
      expect(result.restingHr.points).toHaveLength(5);
      expect(result.restingHr.baseline).not.toBeNull();
      // Resting HR decreased from 62 -> 55, should be improving
      expect(result.restingHr.trendDirection).toBe("improving");

      // Sleep
      expect(result.sleep.points).toHaveLength(5);
      expect(result.sleep.baseline).not.toBeNull();
      expect(result.sleep.average).toBeGreaterThan(7.0);

      // Status distribution
      expect(result.statusDistribution.push).toBe(3);
      expect(result.statusDistribution.moderate).toBe(1);
      expect(result.statusDistribution.recover).toBe(1);
      expect(result.statusDistribution.total).toBe(5);
    });
  });

  describe("Utility functions", () => {
    it("formats short day label correctly", () => {
      // 2026-09-21 is Monday
      expect(getDayOfWeekLabel("2026-09-21")).toBe("Mon");
      expect(getDayOfWeekLabel("2026-09-20")).toBe("Sun");
    });
  });
});
