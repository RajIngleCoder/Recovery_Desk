import {
  calculateBaseline,
  deduplicateEntries,
  filterEntriesInWindow,
  isHrvValid,
  isRestingHrValid,
  isSleepValid,
  calculateMetricAverage,
  HistoricalMetricInput,
} from "../baseline";

describe("Recovery Engine — Baseline Calculation", () => {
  const referenceDate = "2026-09-21";

  describe("Empty data", () => {
    it("returns null baselines and learning status for empty entries array", () => {
      const result = calculateBaseline([], { referenceDate });

      expect(result.dataCount).toBe(0);
      expect(result.status).toBe("learning");
      expect(result.hrvBaseline).toBeNull();
      expect(result.restingHrBaseline).toBeNull();
      expect(result.sleepBaseline).toBeNull();
      expect(result.metricCounts).toEqual({ hrv: 0, restingHr: 0, sleep: 0 });
      expect(result.provisional).toEqual({
        hrvBaseline: null,
        restingHrBaseline: null,
        sleepBaseline: null,
      });
    });
  });

  describe("One entry (insufficient data)", () => {
    it("returns learning status and null baselines for single entry", () => {
      const singleEntry: HistoricalMetricInput[] = [
        {
          date: "2026-03-01",
          hrv: 60,
          resting_hr: 50,
          sleep_hours: 8.0,
        },
      ];

      const result = calculateBaseline(singleEntry, {
        referenceDate: "2026-03-01",
      });

      expect(result.dataCount).toBe(1);
      expect(result.status).toBe("learning");
      expect(result.hrvBaseline).toBeNull();
      expect(result.restingHrBaseline).toBeNull();
      expect(result.sleepBaseline).toBeNull();

      expect(result.provisional?.hrvBaseline).toBe(60);
      expect(result.provisional?.restingHrBaseline).toBe(50);
      expect(result.provisional?.sleepBaseline).toBe(8.0);
    });

    it("returns learning status for two entries when minObservations is configured to 3", () => {
      const twoEntries: HistoricalMetricInput[] = [
        { date: "2026-03-01", hrv: 60, resting_hr: 50, sleep_hours: 8 },
        { date: "2026-03-02", hrv: 65, resting_hr: 52, sleep_hours: 7.5 },
      ];

      const result = calculateBaseline(twoEntries, {
        referenceDate: "2026-03-02",
        minObservations: 3,
      });

      expect(result.dataCount).toBe(2);
      expect(result.status).toBe("learning");
      expect(result.hrvBaseline).toBeNull();
      expect(result.restingHrBaseline).toBeNull();
      expect(result.sleepBaseline).toBeNull();
    });
  });

  describe("Established baseline", () => {
    it("establishes baseline when minimum observations are met", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: 7.0 },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.dataCount).toBe(3);
      expect(result.status).toBe("established");
      expect(result.hrvBaseline).toBe(60); // (60+55+65)/3 = 60.0
      expect(result.restingHrBaseline).toBe(50); // (50+52+48)/3 = 50.0
      expect(result.sleepBaseline).toBe(7.5); // (8.0+7.5+7.0)/3 = 7.5
    });
  });

  describe("Missing optional fields", () => {
    it("handles uneven metric availability across dates", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: null },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: null },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.metricCounts?.hrv).toBe(3);
      expect(result.metricCounts?.restingHr).toBe(3);
      expect(result.metricCounts?.sleep).toBe(1);

      expect(result.hrvBaseline).toBe(60);
      expect(result.restingHrBaseline).toBe(50);
      expect(result.sleepBaseline).toBeNull();
      expect(result.status).toBe("learning");
    });
  });

  describe("Abnormal values", () => {
    it("filters out abnormal HRV values", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: -10, resting_hr: 52, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 999, resting_hr: 48, sleep_hours: 7.0 },
        { date: "2026-09-18", hrv: 70, resting_hr: 51, sleep_hours: 7.8 },
        { date: "2026-09-17", hrv: 65, resting_hr: 49, sleep_hours: 8.2 },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.metricCounts?.hrv).toBe(3);
      expect(result.hrvBaseline).toBe(65);
      expect(result.metricCounts?.restingHr).toBe(5);
    });

    it("filters out abnormal resting HR values", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 15, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 65, resting_hr: 300, sleep_hours: 7.0 },
        { date: "2026-09-18", hrv: 70, resting_hr: 52, sleep_hours: 7.8 },
        { date: "2026-09-17", hrv: 62, resting_hr: 48, sleep_hours: 8.2 },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.metricCounts?.restingHr).toBe(3);
      expect(result.restingHrBaseline).toBe(50);
    });

    it("filters out abnormal sleep values", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: -2 },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: 28 },
        { date: "2026-09-18", hrv: 70, resting_hr: 52, sleep_hours: 7.0 },
        { date: "2026-09-17", hrv: 62, resting_hr: 48, sleep_hours: 9.0 },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.metricCounts?.sleep).toBe(3);
      expect(result.sleepBaseline).toBe(8);
    });
  });

  describe("Duplicate dates", () => {
    it("deduplicates multiple entries for the same calendar date", () => {
      const entries: HistoricalMetricInput[] = [
        {
          date: "2026-09-21",
          hrv: 60,
          resting_hr: 50,
          sleep_hours: 8.0,
          updated_at: "2026-09-21T10:00:00Z",
        },
        {
          date: "2026-09-21",
          hrv: 40,
          resting_hr: 70,
          sleep_hours: 5.0,
          updated_at: "2026-09-21T08:00:00Z",
        },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: 7.0 },
      ];

      const result = calculateBaseline(entries, { referenceDate });

      expect(result.dataCount).toBe(3);
      expect(result.status).toBe("established");
      expect(result.hrvBaseline).toBe(60);
      expect(result.restingHrBaseline).toBe(50);
    });
  });

  describe("Historical window boundaries", () => {
    it("excludes entries outside the 14-day rolling window", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: 7.0 },
        { date: "2026-09-05", hrv: 100, resting_hr: 35, sleep_hours: 12.0 },
      ];

      const result = calculateBaseline(entries, {
        referenceDate: "2026-09-21",
        windowDays: 14,
      });

      expect(result.dataCount).toBe(3);
      expect(result.hrvBaseline).toBe(60);
      expect(result.restingHrBaseline).toBe(50);
      expect(result.sleepBaseline).toBe(7.5);
    });

    it("excludes future dates relative to referenceDate", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-22", hrv: 100, resting_hr: 30, sleep_hours: 10.0 },
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
        { date: "2026-09-20", hrv: 55, resting_hr: 52, sleep_hours: 7.5 },
        { date: "2026-09-19", hrv: 65, resting_hr: 48, sleep_hours: 7.0 },
      ];

      const result = calculateBaseline(entries, {
        referenceDate: "2026-09-21",
      });

      expect(result.dataCount).toBe(3);
      expect(result.hrvBaseline).toBe(60);
    });
  });

  describe("allowProvisional option", () => {
    it("returns calculated mean even under minObservations when allowProvisional is true", () => {
      const entries: HistoricalMetricInput[] = [
        { date: "2026-09-21", hrv: 60, resting_hr: 50, sleep_hours: 8.0 },
      ];

      const result = calculateBaseline(entries, {
        referenceDate,
        allowProvisional: true,
      });

      expect(result.status).toBe("learning");
      expect(result.dataCount).toBe(1);
      expect(result.hrvBaseline).toBe(60);
      expect(result.restingHrBaseline).toBe(50);
      expect(result.sleepBaseline).toBe(8);
    });
  });

  describe("Pure utility validators", () => {
    it("validates HRV boundaries correctly", () => {
      expect(isHrvValid(50)).toBe(true);
      expect(isHrvValid(1)).toBe(true);
      expect(isHrvValid(300)).toBe(true);
      expect(isHrvValid(0)).toBe(false);
      expect(isHrvValid(-5)).toBe(false);
      expect(isHrvValid(301)).toBe(false);
      expect(isHrvValid(NaN)).toBe(false);
      expect(isHrvValid("50")).toBe(false);
      expect(isHrvValid(null)).toBe(false);
    });

    it("validates resting HR boundaries correctly", () => {
      expect(isRestingHrValid(60)).toBe(true);
      expect(isRestingHrValid(30)).toBe(true);
      expect(isRestingHrValid(220)).toBe(true);
      expect(isRestingHrValid(29)).toBe(false);
      expect(isRestingHrValid(221)).toBe(false);
      expect(isRestingHrValid(null)).toBe(false);
    });

    it("validates sleep boundaries correctly", () => {
      expect(isSleepValid(7.5)).toBe(true);
      expect(isSleepValid(0.1)).toBe(true);
      expect(isSleepValid(24)).toBe(true);
      expect(isSleepValid(0)).toBe(false);
      expect(isSleepValid(24.1)).toBe(false);
      expect(isSleepValid(null)).toBe(false);
    });

    it("calculates metric averages with specified decimals", () => {
      expect(calculateMetricAverage([10, 20, 30])).toBe(20);
      expect(calculateMetricAverage([7.1, 7.2, 7.4], 2)).toBe(7.23);
      expect(calculateMetricAverage([])).toBeNull();
    });
  });
});
