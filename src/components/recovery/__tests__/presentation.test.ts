import { calculateRecoveryDecision } from "@/domain/recovery/scoring";
import { calculateBaseline } from "@/domain/recovery/baseline";
import { DailyMetricRow } from "@/types/database";

describe("Phase 8 Home Recommendation Presentation Logic", () => {
  const referenceDate = "2026-09-21";

  const historyEntries: DailyMetricRow[] = [
    {
      id: "entry-1",
      user_id: "user-123",
      date: "2026-09-18",
      hrv: 60,
      resting_hr: 58,
      sleep_hours: 8.0,
      sleep_score: null,
      activity_load: "moderate",
      notes: null,
      created_at: "2026-09-18T08:00:00Z",
      updated_at: "2026-09-18T08:00:00Z",
    },
    {
      id: "entry-2",
      user_id: "user-123",
      date: "2026-09-19",
      hrv: 62,
      resting_hr: 57,
      sleep_hours: 7.8,
      sleep_score: null,
      activity_load: "low",
      notes: null,
      created_at: "2026-09-19T08:00:00Z",
      updated_at: "2026-09-19T08:00:00Z",
    },
    {
      id: "entry-3",
      user_id: "user-123",
      date: "2026-09-20",
      hrv: 61,
      resting_hr: 58,
      sleep_hours: 8.2,
      sleep_score: null,
      activity_load: "moderate",
      notes: null,
      created_at: "2026-09-20T08:00:00Z",
      updated_at: "2026-09-20T08:00:00Z",
    },
  ];

  it("formats decision factors correctly with established baseline for today's data", () => {
    const baseline = calculateBaseline(historyEntries, { referenceDate });
    expect(baseline.status).toBe("established");

    const decision = calculateRecoveryDecision({
      hrv: 72,
      restingHr: 54,
      sleepHours: 8.5,
      activityLoad: "low",
      hrvBaseline: baseline.hrvBaseline!,
      restingHrBaseline: baseline.restingHrBaseline!,
      sleepBaseline: baseline.sleepBaseline!,
    });

    expect(decision.status).toBe("PUSH");
    expect(decision.score).toBeGreaterThanOrEqual(75);
    expect(decision.factors).toHaveLength(4);

    // HRV factor
    const hrvFactor = decision.factors.find((f) => f.metric === "hrv");
    expect(hrvFactor).toBeDefined();
    expect(hrvFactor?.currentValue).toBe("72 ms");
    expect(hrvFactor?.baselineValue).toBe(`${baseline.hrvBaseline} ms`);
    expect(hrvFactor?.sentiment).toBe("positive");

    // Resting HR factor
    const rhrFactor = decision.factors.find((f) => f.metric === "resting_hr");
    expect(rhrFactor).toBeDefined();
    expect(rhrFactor?.currentValue).toBe("54 bpm");
    expect(rhrFactor?.baselineValue).toBe(`${Math.round(baseline.restingHrBaseline!)} bpm`);
    expect(rhrFactor?.sentiment).toBe("positive");

    // Sleep factor
    const sleepFactor = decision.factors.find((f) => f.metric === "sleep");
    expect(sleepFactor).toBeDefined();
    expect(sleepFactor?.currentValue).toBe("8h 30m");
    expect(sleepFactor?.baselineValue).toBe("8h");
    expect(sleepFactor?.sentiment).toBe("positive");

    // Activity load factor
    const loadFactor = decision.factors.find((f) => f.metric === "activity_load");
    expect(loadFactor).toBeDefined();
    expect(loadFactor?.sentiment).toBe("positive");
  });

  it("handles learning baseline presentation when observations are insufficient", () => {
    // Only 1 historical entry
    const learningHistory = [historyEntries[0]];
    const baseline = calculateBaseline(learningHistory, { referenceDate });
    expect(baseline.status).toBe("learning");
    expect(baseline.hrvBaseline).toBeNull();

    const decision = calculateRecoveryDecision({
      hrv: 55,
      restingHr: 60,
      sleepHours: 7.0,
      activityLoad: "moderate",
    });

    expect(decision.baselineStatus).toBe("learning");
    expect(decision.reason).toContain("baseline is currently learning");

    // Factors should still be present with baselineValue undefined and deviation showing 'Learning baseline'
    const hrvFactor = decision.factors.find((f) => f.metric === "hrv");
    expect(hrvFactor?.baselineValue).toBeUndefined();
    expect(hrvFactor?.deviation).toBe("Learning baseline");
  });

  it("accurately handles recent load from yesterday's entry", () => {
    const yesterday = "2026-09-20";
    const yesterdayEntry = historyEntries.find((e) => e.date === yesterday);
    expect(yesterdayEntry).toBeDefined();
    expect(yesterdayEntry?.activity_load).toBe("moderate");
  });
});
