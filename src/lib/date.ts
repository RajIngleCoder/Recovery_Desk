/**
 * Date and time utilities for Recovery Desk.
 * Handles local date formatting, ISO conversions, and duration calculations.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 * Avoids UTC boundary drift where late night or early morning entries
 * might be recorded under the wrong date.
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a string is a strict YYYY-MM-DD calendar date.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Formats a YYYY-MM-DD string into a human-readable display date.
 * e.g., "Monday, September 21" or "Sep 21, 2026"
 */
export function formatDisplayDate(
  dateStr: string,
  options: { includeWeekday?: boolean; includeYear?: boolean } = {
    includeWeekday: true,
    includeYear: false,
  }
): string {
  if (!isValidDateString(dateStr)) {
    return dateStr;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (options.includeWeekday) {
    formatOptions.weekday = "long";
  }

  if (options.includeYear) {
    formatOptions.year = "numeric";
  }

  return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
}

/**
 * Converts hours and minutes into decimal hours rounded to 2 decimal places.
 * e.g., 7 hours, 30 minutes -> 7.50
 */
export function hoursAndMinutesToDecimal(
  hours: number,
  minutes: number
): number {
  const total = hours + minutes / 60;
  return Math.round(total * 100) / 100;
}

/**
 * Converts decimal hours into hours and minutes.
 * e.g., 7.5 -> { hours: 7, minutes: 30 }
 */
export function decimalToHoursAndMinutes(decimal: number): {
  hours: number;
  minutes: number;
} {
  if (isNaN(decimal) || decimal <= 0) {
    return { hours: 0, minutes: 0 };
  }

  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);

  if (minutes >= 60) {
    return { hours: hours + 1, minutes: 0 };
  }

  return { hours, minutes };
}

/**
 * Formats decimal sleep hours into a compact display string.
 * e.g., 7.5 -> "7h 30m"
 */
export function formatSleepDuration(decimalHours: number): string {
  const { hours, minutes } = decimalToHoursAndMinutes(decimalHours);
  if (hours === 0 && minutes === 0) return "0h";
  if (minutes === 0) return `${hours}h`;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
