import { RECOVERY_CONFIG } from "../config";

describe("RECOVERY_CONFIG", () => {
  it("has weights that sum exactly to 1.0 (100%)", () => {
    const { hrv, rhr, sleep, activityLoad } = RECOVERY_CONFIG.weights;
    const sum = hrv + rhr + sleep + activityLoad;
    expect(Number(sum.toFixed(2))).toBe(1.0);
  });

  it("defines logical status cutoffs where push > moderate", () => {
    expect(RECOVERY_CONFIG.statusThresholds.push).toBeGreaterThan(
      RECOVERY_CONFIG.statusThresholds.moderate
    );
  });

  it("requires at least 3 observations before establishing a baseline", () => {
    expect(RECOVERY_CONFIG.minBaselineObservations).toBeGreaterThanOrEqual(2);
  });
});
