import {
  getTodayDateString,
  isValidDateString,
  formatDisplayDate,
  hoursAndMinutesToDecimal,
  decimalToHoursAndMinutes,
  formatSleepDuration,
} from "../date";

describe("Date and Time Utilities", () => {
  describe("getTodayDateString", () => {
    it("returns formatted YYYY-MM-DD from provided date", () => {
      const testDate = new Date(2026, 8, 21); // Sept 21, 2026
      expect(getTodayDateString(testDate)).toBe("2026-09-21");
    });

    it("pads single digit months and days", () => {
      const testDate = new Date(2026, 0, 5); // Jan 5, 2026
      expect(getTodayDateString(testDate)).toBe("2026-01-05");
    });
  });

  describe("isValidDateString", () => {
    it("validates valid YYYY-MM-DD format", () => {
      expect(isValidDateString("2026-09-21")).toBe(true);
      expect(isValidDateString("2026-02-28")).toBe(true);
    });

    it("rejects invalid date formats", () => {
      expect(isValidDateString("21-09-2026")).toBe(false);
      expect(isValidDateString("2026/09/21")).toBe(false);
      expect(isValidDateString("invalid")).toBe(false);
      expect(isValidDateString("")).toBe(false);
    });

    it("rejects non-existent calendar dates", () => {
      expect(isValidDateString("2026-02-30")).toBe(false);
      expect(isValidDateString("2026-04-31")).toBe(false);
      expect(isValidDateString("2026-13-01")).toBe(false);
    });
  });

  describe("formatDisplayDate", () => {
    it("formats date with weekday and month", () => {
      const formatted = formatDisplayDate("2026-09-21", {
        includeWeekday: true,
      });
      expect(formatted).toContain("Sep");
      expect(formatted).toContain("21");
    });

    it("formats date with year when requested", () => {
      const formatted = formatDisplayDate("2026-09-21", {
        includeWeekday: false,
        includeYear: true,
      });
      expect(formatted).toContain("2026");
    });

    it("returns raw string if date is invalid", () => {
      expect(formatDisplayDate("invalid-date")).toBe("invalid-date");
    });
  });

  describe("hoursAndMinutesToDecimal", () => {
    it("converts hours and minutes accurately", () => {
      expect(hoursAndMinutesToDecimal(7, 30)).toBe(7.5);
      expect(hoursAndMinutesToDecimal(8, 0)).toBe(8);
      expect(hoursAndMinutesToDecimal(6, 45)).toBe(6.75);
      expect(hoursAndMinutesToDecimal(0, 45)).toBe(0.75);
    });

    it("rounds decimal to 2 decimal places", () => {
      // 7 hours 20 minutes = 7.33333... -> 7.33
      expect(hoursAndMinutesToDecimal(7, 20)).toBe(7.33);
    });
  });

  describe("decimalToHoursAndMinutes", () => {
    it("converts decimal hours to hours and minutes", () => {
      expect(decimalToHoursAndMinutes(7.5)).toEqual({ hours: 7, minutes: 30 });
      expect(decimalToHoursAndMinutes(8)).toEqual({ hours: 8, minutes: 0 });
      expect(decimalToHoursAndMinutes(6.75)).toEqual({ hours: 6, minutes: 45 });
    });

    it("handles zero or invalid decimal values safely", () => {
      expect(decimalToHoursAndMinutes(0)).toEqual({ hours: 0, minutes: 0 });
      expect(decimalToHoursAndMinutes(-2)).toEqual({ hours: 0, minutes: 0 });
      expect(decimalToHoursAndMinutes(NaN)).toEqual({ hours: 0, minutes: 0 });
    });
  });

  describe("formatSleepDuration", () => {
    it("formats durations nicely", () => {
      expect(formatSleepDuration(7.5)).toBe("7h 30m");
      expect(formatSleepDuration(8.0)).toBe("8h");
      expect(formatSleepDuration(0.5)).toBe("30m");
      expect(formatSleepDuration(0)).toBe("0h");
    });
  });
});
