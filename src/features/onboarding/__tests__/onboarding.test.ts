import { validateOnboarding } from "@/lib/validation";

describe("Onboarding Validation", () => {
  it("accepts valid onboarding data", () => {
    const result = validateOnboarding({
      displayName: "Alex Morgan",
      goal: "training",
      sleepTargetHours: 8.5,
    });
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts string-based numeric sleep target", () => {
    const result = validateOnboarding({
      displayName: "Taylor",
      goal: "general",
      sleepTargetHours: "7.5",
    });
    expect(result.isValid).toBe(true);
  });

  it("rejects empty or whitespace display name", () => {
    const result = validateOnboarding({
      displayName: "   ",
      goal: "fitness",
      sleepTargetHours: 8.0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a display name.");
  });

  it("rejects display name exceeding 50 characters", () => {
    const longName = "A".repeat(51);
    const result = validateOnboarding({
      displayName: longName,
      goal: "fitness",
      sleepTargetHours: 8.0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Display name must not exceed 50 characters.");
  });

  it("rejects unknown goal types", () => {
    const result = validateOnboarding({
      displayName: "Jordan",
      goal: "weight-loss", // Not in allowed GoalType
      sleepTargetHours: 8.0,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please select a valid recovery goal.");
  });

  it("accepts all three valid goals: general, training, fitness", () => {
    const goals = ["general", "training", "fitness"];
    for (const g of goals) {
      const result = validateOnboarding({
        displayName: "Jordan",
        goal: g,
        sleepTargetHours: 8.0,
      });
      expect(result.isValid).toBe(true);
    }
  });

  it("rejects sleep target below 4.0 hours", () => {
    const result = validateOnboarding({
      displayName: "Alex",
      goal: "general",
      sleepTargetHours: 3.5,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Please enter a realistic sleep target between 4 and 16 hours."
    );
  });

  it("rejects sleep target above 16.0 hours", () => {
    const result = validateOnboarding({
      displayName: "Alex",
      goal: "general",
      sleepTargetHours: 17,
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Please enter a realistic sleep target between 4 and 16 hours."
    );
  });

  it("rejects non-numeric sleep target", () => {
    const result = validateOnboarding({
      displayName: "Alex",
      goal: "general",
      sleepTargetHours: "eight-hours",
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Please enter a realistic sleep target between 4 and 16 hours."
    );
  });
});
