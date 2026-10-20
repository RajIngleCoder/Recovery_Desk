import {
  calculateRecoveryDecision,
  calculateHrvSubscore,
  calculateRhrSubscore,
  calculateSleepSubscore,
  calculateActivityLoadSubscore,
} from "../scoring";
import { RecoveryInput } from "../types";

describe("Recovery Engine — Deterministic Scoring", () => {
  describe("Good Recovery Scenario (PUSH)", () => {
    it("classifies ideal markers as PUSH with high score", () => {
      const input: RecoveryInput = {
        hrv: 66, // +10% vs baseline (60)
        hrvBaseline: 60,
        restingHr: 48, // -2 bpm vs baseline (50)
        restingHrBaseline: 50,
        sleepHours: 8.5, // +0.5h vs baseline (8.0)
        sleepBaseline: 8.0,
        activityLoad: "low",
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.status).toBe("PUSH");
      expect(decision.score).toBeGreaterThanOrEqual(75);
      expect(decision.score).toBeLessThanOrEqual(100);
      expect(decision.baselineStatus).toBe("established");
      expect(decision.title).toBe("You're in a great spot today");
      expect(decision.reason).toContain("optimal ranges");
      expect(decision.reason).toContain("low activity load");

      // Verify contributing factors
      expect(decision.factors).toHaveLength(4);
      const hrvFactor = decision.factors.find((f) => f.metric === "hrv");
      expect(hrvFactor?.sentiment).toBe("positive");
      expect(hrvFactor?.deviation).toContain("+10%");

      const rhrFactor = decision.factors.find((f) => f.metric === "resting_hr");
      expect(rhrFactor?.sentiment).toBe("positive");
      expect(rhrFactor?.deviation).toContain("-2 bpm");
    });
  });

  describe("Moderate Recovery Scenario (MODERATE)", () => {
    it("classifies baseline-adjacent markers as MODERATE", () => {
      const input: RecoveryInput = {
        hrv: 55, // -8.3% vs baseline (60) -> mild deficit
        hrvBaseline: 60,
        restingHr: 53, // +3 bpm vs baseline (50) -> mild elevation
        restingHrBaseline: 50,
        sleepHours: 7.0, // -1.0h vs baseline (8.0) -> mild deficit
        sleepBaseline: 8.0,
        activityLoad: "moderate",
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.status).toBe("MODERATE");
      expect(decision.score).toBeGreaterThanOrEqual(50);
      expect(decision.score).toBeLessThan(75);
      expect(decision.title).toBe("Keep today moderate");
      expect(decision.reason).toContain("close to your rolling baseline");
    });
  });

  describe("Poor Recovery Scenario (RECOVER)", () => {
    it("classifies suppressed biomarkers and high load as RECOVER", () => {
      const input: RecoveryInput = {
        hrv: 42, // -30% vs baseline (60)
        hrvBaseline: 60,
        restingHr: 58, // +8 bpm vs baseline (50)
        restingHrBaseline: 50,
        sleepHours: 5.5, // -2.5h vs baseline (8.0)
        sleepBaseline: 8.0,
        activityLoad: "high",
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.status).toBe("RECOVER");
      expect(decision.score).toBeLessThan(50);
      expect(decision.title).toBe("Prioritize rest and recovery today");
      expect(decision.reason).toContain("elevated fatigue");

      // Verify negative sentiments on factors
      const hrvFactor = decision.factors.find((f) => f.metric === "hrv");
      expect(hrvFactor?.sentiment).toBe("negative");

      const rhrFactor = decision.factors.find((f) => f.metric === "resting_hr");
      expect(rhrFactor?.sentiment).toBe("negative");
    });
  });

  describe("Boundary values and threshold cutoffs", () => {
    it("awards PUSH status at exactly score = 75.0 or above", () => {
      // Input specifically tuned to land >= 75
      const input: RecoveryInput = {
        hrv: 60, // 0% deviation -> subscore 82.5
        hrvBaseline: 60,
        restingHr: 50, // 0 bpm deviation -> subscore 85
        restingHrBaseline: 50,
        sleepHours: 8.0, // 0h deviation -> subscore 82.5
        sleepBaseline: 8.0,
        activityLoad: "low", // 100
      };

      const decision = calculateRecoveryDecision(input);
      // Expected composite: (82.5 * 0.40) + (85 * 0.30) + (82.5 * 0.20) + (100 * 0.10)
      // = 33 + 25.5 + 16.5 + 10 = 85.0 -> PUSH
      expect(decision.status).toBe("PUSH");
      expect(decision.score).toBe(85.0);
    });

    it("evaluates subscore boundary conditions for HRV", () => {
      // +5% boundary
      const exc = calculateHrvSubscore(105, 100);
      expect(exc.score).toBe(90);
      expect(exc.sentiment).toBe("positive");

      // -5% boundary
      const normLow = calculateHrvSubscore(95, 100);
      expect(normLow.score).toBe(75);
      expect(normLow.sentiment).toBe("neutral");

      // -15% boundary
      const mildLow = calculateHrvSubscore(85, 100);
      expect(mildLow.score).toBe(50);
      expect(mildLow.sentiment).toBe("negative");
    });

    it("evaluates subscore boundary conditions for Resting HR", () => {
      // -1 bpm boundary
      const opt = calculateRhrSubscore(49, 50);
      expect(opt.score).toBe(90);
      expect(opt.sentiment).toBe("positive");

      // +2 bpm boundary
      const norm = calculateRhrSubscore(52, 50);
      expect(norm.score).toBe(75);
      expect(norm.sentiment).toBe("neutral");

      // +5 bpm boundary
      const elevated = calculateRhrSubscore(55, 50);
      expect(elevated.score).toBe(50);
      expect(elevated.sentiment).toBe("negative");
    });

    it("evaluates subscore boundary conditions for Sleep Duration", () => {
      // +0.5h boundary
      const surplus = calculateSleepSubscore(8.5, 8.0);
      expect(surplus.score).toBe(90);
      expect(surplus.sentiment).toBe("positive");

      // -0.5h boundary
      const norm = calculateSleepSubscore(7.5, 8.0);
      expect(norm.score).toBe(75);
      expect(norm.sentiment).toBe("neutral");

      // -1.5h boundary
      const mild = calculateSleepSubscore(6.5, 8.0);
      expect(mild.score).toBe(50);
      expect(mild.sentiment).toBe("negative");
    });
  });

  describe("Insufficient data (Learning Baseline Fallback)", () => {
    it("handles missing baselines gracefully without crashing", () => {
      const input: RecoveryInput = {
        hrv: 55,
        restingHr: 58,
        sleepHours: 7.5,
        activityLoad: "moderate",
        // No baselines provided
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.baselineStatus).toBe("learning");
      expect(decision.title).toBe("Recovery data logged");
      expect(decision.reason).toContain("baseline is currently learning");

      for (const factor of decision.factors) {
        if (factor.metric !== "activity_load") {
          expect(factor.deviation).toBe("Learning baseline");
          expect(factor.baselineValue).toBeUndefined();
        }
      }

      // Valid score generated using population typical fallback
      expect(decision.score).toBeGreaterThan(0);
      expect(decision.score).toBeLessThanOrEqual(100);
      expect(isNaN(decision.score)).toBe(false);
    });
  });

  describe("Zero and invalid / abnormal values", () => {
    it("handles zero values without returning NaN or dividing by zero", () => {
      const input: RecoveryInput = {
        hrv: 0,
        hrvBaseline: 60,
        restingHr: 0,
        restingHrBaseline: 50,
        sleepHours: 0,
        sleepBaseline: 8.0,
        activityLoad: "low",
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.status).toBe("RECOVER");
      expect(decision.score).toBe(10); // only activity load contributes
      expect(isNaN(decision.score)).toBe(false);
      expect(decision.factors).toHaveLength(4);
    });

    it("clamps negative values safely", () => {
      const input: RecoveryInput = {
        hrv: -10,
        hrvBaseline: 60,
        restingHr: -5,
        restingHrBaseline: 50,
        sleepHours: -2,
        sleepBaseline: 8.0,
        activityLoad: "high",
      };

      const decision = calculateRecoveryDecision(input);

      expect(decision.status).toBe("RECOVER");
      expect(decision.score).toBeGreaterThanOrEqual(0);
      expect(isNaN(decision.score)).toBe(false);
    });

    it("clamps extreme / impossible high values safely", () => {
      const input: RecoveryInput = {
        hrv: 999,
        hrvBaseline: 60,
        restingHr: 350,
        restingHrBaseline: 50,
        sleepHours: 35,
        sleepBaseline: 8.0,
        activityLoad: "moderate",
      };

      const decision = calculateRecoveryDecision(input);

      expect(isNaN(decision.score)).toBe(false);
      expect(decision.score).toBeGreaterThanOrEqual(0);
      expect(decision.score).toBeLessThanOrEqual(100);
    });
  });

  describe("Non-diagnostic medical claims compliance", () => {
    it("ensures output copy does not make medical diagnoses", () => {
      const inputs: RecoveryInput[] = [
        { hrv: 70, hrvBaseline: 60, restingHr: 48, restingHrBaseline: 50, sleepHours: 8.5, sleepBaseline: 8.0, activityLoad: "low" },
        { hrv: 35, hrvBaseline: 60, restingHr: 65, restingHrBaseline: 50, sleepHours: 4.0, sleepBaseline: 8.0, activityLoad: "high" },
        { hrv: 50, restingHr: 60, sleepHours: 7.0, activityLoad: "moderate" },
      ];

      const forbiddenTerms = [
        "diagnosis",
        "disease",
        "infection",
        "inflamed",
        "overtrained",
        "sick",
        "pathology",
        "clinical",
      ];

      for (const input of inputs) {
        const decision = calculateRecoveryDecision(input);
        const fullText = `${decision.title} ${decision.body} ${decision.action} ${decision.reason}`.toLowerCase();

        for (const term of forbiddenTerms) {
          expect(fullText).not.toContain(term);
        }
      }
    });
  });

  describe("Activity load scoring", () => {
    it("returns expected subscores for activity loads", () => {
      expect(calculateActivityLoadSubscore("low").score).toBe(100);
      expect(calculateActivityLoadSubscore("moderate").score).toBe(95);
      expect(calculateActivityLoadSubscore("high").score).toBe(85);
    });
  });
});
