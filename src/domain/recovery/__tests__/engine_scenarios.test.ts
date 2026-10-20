import { calculateBaseline } from "../baseline";
import { calculateRecoveryDecision } from "../scoring";
import { calculateTrends } from "../trends";
import { validateDailyMetricsInput } from "@/lib/validation";
import { DailyMetricRow } from "@/types/database";

describe("Recovery Engine Scenarios & Trust Audit", () => {
  const historyDays1and2: DailyMetricRow[] = [
    {
      id: "entry-1",
      user_id: "user-1",
      date: "2026-09-20",
      sleep_hours: 7.75,
      sleep_score: 85,
      hrv: 65,
      resting_hr: 52,
      activity_load: "moderate",
      notes: null,
      created_at: "2026-09-20T07:00:00Z",
      updated_at: "2026-09-20T07:00:00Z",
    },
    {
      id: "entry-2",
      user_id: "user-1",
      date: "2026-09-21",
      sleep_hours: 8.0,
      sleep_score: 90,
      hrv: 68,
      resting_hr: 50,
      activity_load: "low",
      notes: null,
      created_at: "2026-09-21T07:00:00Z",
      updated_at: "2026-09-21T07:00:00Z",
    },
  ];

  it("Scenario A: The Well-Rested Athlete produces Green / PUSH (~90–94 score)", () => {
    const baseline = calculateBaseline(historyDays1and2, {
      referenceDate: "2026-09-22",
      windowDays: 14,
    });

    expect(baseline.status).toBe("established");
    expect(baseline.hrvBaseline).toBeCloseTo(66.5, 1);
    expect(baseline.restingHrBaseline).toBeCloseTo(51.0, 1);
    expect(baseline.sleepBaseline).toBeCloseTo(7.88, 1);

    const todayDecision = calculateRecoveryDecision({
      hrv: 74,
      restingHr: 48,
      sleepHours: 8.25,
      activityLoad: "low",
      hrvBaseline: baseline.hrvBaseline ?? undefined,
      restingHrBaseline: baseline.restingHrBaseline ?? undefined,
      sleepBaseline: baseline.sleepBaseline ?? undefined,
    });

    expect(todayDecision.status).toBe("PUSH");
    expect(todayDecision.score).toBeGreaterThanOrEqual(90);
    expect(todayDecision.score).toBeLessThanOrEqual(95);

    const hrvFactor = todayDecision.factors.find((f) => f.metric === "hrv");
    const rhrFactor = todayDecision.factors.find((f) => f.metric === "resting_hr");
    expect(hrvFactor?.sentiment).toBe("positive");
    expect(rhrFactor?.sentiment).toBe("positive");
  });

  it("Scenario B: The Overreached / Strained Athlete produces Red / RECOVER (score < 55)", () => {
    const baseline = calculateBaseline(historyDays1and2, {
      referenceDate: "2026-09-22",
      windowDays: 14,
    });

    const todayDecision = calculateRecoveryDecision({
      hrv: 42,
      restingHr: 59,
      sleepHours: 5.25,
      activityLoad: "high",
      hrvBaseline: baseline.hrvBaseline ?? undefined,
      restingHrBaseline: baseline.restingHrBaseline ?? undefined,
      sleepBaseline: baseline.sleepBaseline ?? undefined,
    });

    expect(todayDecision.status).toBe("RECOVER");
    expect(todayDecision.score).toBeLessThan(55);

    const hrvFactor = todayDecision.factors.find((f) => f.metric === "hrv");
    const rhrFactor = todayDecision.factors.find((f) => f.metric === "resting_hr");
    expect(hrvFactor?.sentiment).toBe("negative");
    expect(rhrFactor?.sentiment).toBe("negative");
  });

  it("Scenario C: Steady State produces Amber / MODERATE (score ~76–82)", () => {
    const baseline = calculateBaseline(historyDays1and2, {
      referenceDate: "2026-09-22",
      windowDays: 14,
    });

    const todayDecision = calculateRecoveryDecision({
      hrv: 64,
      restingHr: 51,
      sleepHours: 7.5,
      activityLoad: "moderate",
      hrvBaseline: baseline.hrvBaseline ?? undefined,
      restingHrBaseline: baseline.restingHrBaseline ?? undefined,
      sleepBaseline: baseline.sleepBaseline ?? undefined,
    });

    expect(todayDecision.status).toBe("MODERATE");
    expect(todayDecision.score).toBeGreaterThanOrEqual(75);
    expect(todayDecision.score).toBeLessThanOrEqual(83);
  });

  it("Physiological Guard: Resting HR of 100+ bpm is NEVER scored as optimal recovery", () => {
    const decision = calculateRecoveryDecision({
      hrv: 150,
      restingHr: 100,
      sleepHours: 8.5,
      activityLoad: "low",
      hrvBaseline: 125,
      restingHrBaseline: 125,
      sleepBaseline: 8.0,
    });

    expect(decision.status).not.toBe("PUSH");
    expect(decision.score).toBeLessThanOrEqual(65);

    const rhrFactor = decision.factors.find((f) => f.metric === "resting_hr");
    expect(rhrFactor?.sentiment).toBe("negative");
  });

  it("Consistency: TodayScreen and TrendsScreen produce identical baseline numbers", () => {
    const allEntries: DailyMetricRow[] = [
      ...historyDays1and2,
      {
        id: "entry-3",
        user_id: "user-1",
        date: "2026-09-22",
        sleep_hours: 8.25,
        sleep_score: 92,
        hrv: 74,
        resting_hr: 48,
        activity_load: "low",
        notes: null,
        created_at: "2026-09-22T07:00:00Z",
        updated_at: "2026-09-22T07:00:00Z",
      },
    ];

    const priorEntries = allEntries.filter((m) => m.date !== "2026-09-22");
    const todayBaseline = calculateBaseline(priorEntries, {
      referenceDate: "2026-09-22",
      windowDays: 14,
    });

    const trendsResult = calculateTrends(allEntries, [], "2026-09-22", 7);

    expect(trendsResult.hrv.baseline).toEqual(todayBaseline.hrvBaseline);
    expect(trendsResult.restingHr.baseline).toEqual(todayBaseline.restingHrBaseline);
    expect(trendsResult.sleep.baseline).toEqual(todayBaseline.sleepBaseline);
    expect(trendsResult.baselineStatus).toEqual(todayBaseline.status);
  });

  describe("Input Validation Guards", () => {
    it("rejects Resting HR > 130 bpm or < 35 bpm", () => {
      const highRhr = validateDailyMetricsInput({
        date: "2026-09-22",
        sleepHours: 8,
        hrv: 65,
        restingHr: 200,
        activityLoad: "moderate",
      });
      expect(highRhr.isValid).toBe(false);
      expect(highRhr.errors.restingHr).toContain("between 35 and 130 bpm");

      const lowRhr = validateDailyMetricsInput({
        date: "2026-09-22",
        sleepHours: 8,
        hrv: 65,
        restingHr: 20,
        activityLoad: "moderate",
      });
      expect(lowRhr.isValid).toBe(false);
      expect(lowRhr.errors.restingHr).toContain("between 35 and 130 bpm");
    });

    it("rejects HRV > 250 ms or < 10 ms", () => {
      const highHrv = validateDailyMetricsInput({
        date: "2026-09-22",
        sleepHours: 8,
        hrv: 350,
        restingHr: 50,
        activityLoad: "moderate",
      });
      expect(highHrv.isValid).toBe(false);
      expect(highHrv.errors.hrv).toContain("between 10 and 250 ms");
    });

    it("rejects Sleep < 2 hours or > 16 hours", () => {
      const lowSleep = validateDailyMetricsInput({
        date: "2026-09-22",
        sleepHours: 1,
        hrv: 65,
        restingHr: 50,
        activityLoad: "moderate",
      });
      expect(lowSleep.isValid).toBe(false);
      expect(lowSleep.errors.sleep).toContain("between 2 and 16 hours");
    });

    it("rejects future check-in dates", () => {
      const futureCheckin = validateDailyMetricsInput(
        {
          date: "2026-09-30",
          sleepHours: 8,
          hrv: 65,
          restingHr: 50,
          activityLoad: "moderate",
        },
        "2026-09-22"
      );
      expect(futureCheckin.isValid).toBe(false);
      expect(futureCheckin.errors.date).toContain("cannot be in the future");
    });
  });
});
