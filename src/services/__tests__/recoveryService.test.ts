import { recoveryService } from "../recoveryService";
import { supabase } from "@/lib/supabase";
import { DailyMetricRow, RecommendationRow } from "@/types/database";

describe("Recovery Database Service Contracts", () => {
  it("exports required CRUD methods", () => {
    expect(typeof recoveryService.getDailyMetricsForDate).toBe("function");
    expect(typeof recoveryService.getRecentMetrics).toBe("function");
    expect(typeof recoveryService.saveDailyMetrics).toBe("function");
    expect(typeof recoveryService.deleteDailyMetric).toBe("function");
    expect(typeof recoveryService.getRecommendationForDate).toBe("function");
    expect(typeof recoveryService.saveRecommendation).toBe("function");
  });

  it("handles getRecentMetrics returning empty array on error or empty table", async () => {
    jest.spyOn(supabase, "from").mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
    } as any);

    const metrics = await recoveryService.getRecentMetrics("user-123");
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics).toHaveLength(0);
  });

  it("handles getDailyMetricsForDate returning data when found", async () => {
    const mockRow: DailyMetricRow = {
      id: "metric-1",
      user_id: "user-123",
      date: "2026-09-21",
      sleep_hours: 8.0,
      sleep_score: 90,
      hrv: 60,
      resting_hr: 52,
      activity_load: "low",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    jest.spyOn(supabase, "from").mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: mockRow, error: null }),
    } as any);

    const result = await recoveryService.getDailyMetricsForDate("user-123", "2026-09-21");
    expect(result).not.toBeNull();
    expect(result?.hrv).toBe(60);
    expect(result?.activity_load).toBe("low");
  });

  it("handles saveDailyMetrics upserting successfully", async () => {
    const mockRow: DailyMetricRow = {
      id: "metric-1",
      user_id: "user-123",
      date: "2026-09-21",
      sleep_hours: 7.5,
      sleep_score: null,
      hrv: 55,
      resting_hr: 58,
      activity_load: "moderate",
      notes: "Testing save",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    jest.spyOn(supabase, "from").mockReturnValueOnce({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: mockRow, error: null }),
    } as any);

    const { data, error } = await recoveryService.saveDailyMetrics({
      user_id: "user-123",
      date: "2026-09-21",
      sleep_hours: 7.5,
      hrv: 55,
      resting_hr: 58,
      activity_load: "moderate",
      notes: "Testing save",
    });

    expect(error).toBeUndefined();
    expect(data?.sleep_hours).toBe(7.5);
  });

  it("handles deleteDailyMetric returning error when delete fails", async () => {
    jest.spyOn(supabase, "from").mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ error: { message: "Permission denied" } }),
    } as any);

    const result = await recoveryService.deleteDailyMetric("metric-1");
    expect(result.error).toBe("Permission denied");
  });

  it("handles getDailyMetricById returning single metric", async () => {
    const mockRow: DailyMetricRow = {
      id: "metric-99",
      user_id: "user-123",
      date: "2026-09-20",
      sleep_hours: 8.0,
      sleep_score: 85,
      hrv: 62,
      resting_hr: 49,
      activity_load: "moderate",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    jest.spyOn(supabase, "from").mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValueOnce({ data: mockRow, error: null }),
    } as any);

    const result = await recoveryService.getDailyMetricById("metric-99");
    expect(result?.id).toBe("metric-99");
    expect(result?.hrv).toBe(62);
  });

  it("handles deleteDailyMetricByDate returning success", async () => {
    jest.spyOn(supabase, "from").mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({ error: null }),
      }),
    } as any);

    const result = await recoveryService.deleteDailyMetricByDate("user-123", "2026-09-21");
    expect(result.error).toBeUndefined();
  });

  it("verifies typed contracts for RecommendationRow", () => {
    const mockRec: RecommendationRow = {
      id: "123e4567-e89b-12d3-a456-426614174002",
      user_id: "123e4567-e89b-12d3-a456-426614174001",
      date: "2026-09-21",
      status: "PUSH",
      score: 82.5,
      reason_data: { hrvDeviation: "+8%" },
      created_at: new Date().toISOString(),
    };

    expect(mockRec.status).toBe("PUSH");
    expect(mockRec.score).toBe(82.5);
  });
});
