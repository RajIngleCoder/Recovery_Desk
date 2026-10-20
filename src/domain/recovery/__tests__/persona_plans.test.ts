import { calculateRecoveryDecision } from "../scoring";

describe("Persona-Tailored Plans (Step 1 & Step 2)", () => {
  const baseInput = {
    hrv: 70,
    restingHr: 50,
    sleepHours: 8.5,
    activityLoad: "low" as const,
    hrvBaseline: 65,
    restingHrBaseline: 52,
    sleepBaseline: 8.0,
  };

  it("generates athletic training-focused plan for training persona on PUSH", () => {
    const decision = calculateRecoveryDecision({ ...baseInput, goal: "training" });
    expect(decision.status).toBe("PUSH");
    expect(decision.plan?.training).toContain("High intensity is supported");
    expect(decision.plan?.movement).toContain("Full athletic volume");
  });

  it("generates consistency/routine plan for fitness persona on PUSH", () => {
    const decision = calculateRecoveryDecision({ ...baseInput, goal: "fitness" });
    expect(decision.status).toBe("PUSH");
    expect(decision.plan?.training).toContain("planned workout with confidence");
    expect(decision.plan?.movement).toContain("8,000–10,000+ steps");
  });

  it("generates lifestyle energy plan for general recovery persona on PUSH", () => {
    const decision = calculateRecoveryDecision({ ...baseInput, goal: "general" });
    expect(decision.status).toBe("PUSH");
    expect(decision.plan?.headline).toContain("High energy and vitality");
    expect(decision.plan?.movement).toContain("vibrant, active day");
  });

  it("adapts RECOVER advice across all three personas cleanly without medical overclaims", () => {
    const fatiguedInput = {
      ...baseInput,
      hrv: 45,
      restingHr: 65,
      sleepHours: 5.0,
      activityLoad: "high" as const,
    };

    const trainingDec = calculateRecoveryDecision({ ...fatiguedInput, goal: "training" });
    expect(trainingDec.status).toBe("RECOVER");
    expect(trainingDec.plan?.headline).toContain("avoid adding unnecessary strain");

    const fitnessDec = calculateRecoveryDecision({ ...fatiguedInput, goal: "fitness" });
    expect(fitnessDec.status).toBe("RECOVER");
    expect(fitnessDec.plan?.training).toContain("restorative yoga");

    const generalDec = calculateRecoveryDecision({ ...fatiguedInput, goal: "general" });
    expect(generalDec.status).toBe("RECOVER");
    expect(generalDec.plan?.headline).toContain("Energy reserves are low");
  });
});
