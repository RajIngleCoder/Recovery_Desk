/**
 * Validation rules and error formatting for Recovery Desk.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format according to standard RFC 5322 regex.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter your email address." };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

/**
 * Validates password criteria (minimum 6 characters for MVP).
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Please enter your password." };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  if (password.length > 72) {
    return {
      isValid: false,
      error: "Password must not exceed 72 characters.",
    };
  }

  return { isValid: true };
}

/**
 * Validates complete Sign Up form.
 */
export function validateSignUp(data: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}): ValidationResult {
  const emailVal = validateEmail(data.email);
  if (!emailVal.isValid) return emailVal;

  const passVal = validatePassword(data.password);
  if (!passVal.isValid) return passVal;

  if (data.password !== data.confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  if (data.displayName && data.displayName.trim().length > 50) {
    return {
      isValid: false,
      error: "Display name must not exceed 50 characters.",
    };
  }

  return { isValid: true };
}

/**
 * Validates complete Sign In form.
 */
export function validateSignIn(data: {
  email: string;
  password: string;
}): ValidationResult {
  const emailVal = validateEmail(data.email);
  if (!emailVal.isValid) return emailVal;

  if (!data.password) {
    return { isValid: false, error: "Please enter your password." };
  }

  return { isValid: true };
}

/**
 * Validates onboarding setup form.
 */
export function validateOnboarding(data: {
  displayName: string;
  goal: string;
  sleepTargetHours: number | string;
}): ValidationResult {
  const name = data.displayName ? data.displayName.trim() : "";
  if (!name) {
    return { isValid: false, error: "Please enter a display name." };
  }
  if (name.length > 50) {
    return { isValid: false, error: "Display name must not exceed 50 characters." };
  }

  const validGoals = ["general", "training", "fitness"];
  if (!data.goal || !validGoals.includes(data.goal)) {
    return { isValid: false, error: "Please select a valid recovery goal." };
  }

  const hours =
    typeof data.sleepTargetHours === "number"
      ? data.sleepTargetHours
      : parseFloat(String(data.sleepTargetHours));

  if (isNaN(hours) || hours < 4.0 || hours > 16.0) {
    return {
      isValid: false,
      error: "Please enter a realistic sleep target between 4 and 16 hours.",
    };
  }

  return { isValid: true };
}

/**
 * Maps raw backend/network error messages to calm, user-friendly copy.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  const lower = rawMessage.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
    return "The email or password you entered is incorrect. Please verify your details.";
  }

  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "An account with this email address already exists. Please sign in instead.";
  }

  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox for the activation link.";
  }

  if (lower.includes("network request failed") || lower.includes("fetch failed")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "Account registration is currently paused. Please try again later.";
  }

  // Fallback for general errors
  return rawMessage || "An error occurred during authentication. Please try again.";
}

export interface DailyMetricsInput {
  date: string;
  sleepHours: number | string;
  sleepMinutes?: number | string;
  sleepScore?: number | string | null;
  hrv: number | string;
  restingHr: number | string;
  activityLoad: "low" | "moderate" | "high" | string;
  notes?: string | null;
}

export interface DailyMetricsValidationErrors {
  date?: string;
  sleep?: string;
  sleepScore?: string;
  hrv?: string;
  restingHr?: string;
  activityLoad?: string;
  notes?: string;
  general?: string;
}

export interface DailyMetricsValidationResult {
  isValid: boolean;
  errors: DailyMetricsValidationErrors;
  sanitizedData?: {
    date: string;
    sleep_hours: number;
    sleep_score: number | null;
    hrv: number;
    resting_hr: number;
    activity_load: "low" | "moderate" | "high";
    notes: string | null;
  };
}

/**
 * Validates manual recovery check-in data boundaries and formats.
 */
export function validateDailyMetricsInput(
  input: DailyMetricsInput,
  currentDateStr?: string
): DailyMetricsValidationResult {
  const errors: DailyMetricsValidationErrors = {};

  // 1. Date Validation
  const trimmedDate = (input.date || "").trim();
  if (!trimmedDate) {
    errors.date = "Please select a date for your check-in.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    errors.date = "Date must be in YYYY-MM-DD format.";
  } else {
    const [y, m, d] = trimmedDate.split("-").map(Number);
    const parsedDate = new Date(y, m - 1, d);
    if (
      parsedDate.getFullYear() !== y ||
      parsedDate.getMonth() !== m - 1 ||
      parsedDate.getDate() !== d
    ) {
      errors.date = "Please enter a valid calendar date.";
    } else {
      const today = currentDateStr || new Date().toISOString().slice(0, 10);
      if (trimmedDate > today) {
        errors.date = "Check-in date cannot be in the future.";
      } else {
        const todayDate = new Date(today);
        const diffMs = todayDate.getTime() - parsedDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 365) {
          errors.date = "Check-in date cannot be older than one year.";
        }
      }
    }
  }

  // 2. Sleep Validation
  let totalSleepHours = 0;
  const hoursRaw = String(input.sleepHours ?? "").trim();
  const minutesRaw = String(input.sleepMinutes ?? "").trim();

  if (!hoursRaw && !minutesRaw) {
    errors.sleep = "Please enter your sleep duration.";
  } else {
    // Check if input is entered as hours and minutes separately
    const parsedHours = hoursRaw ? Number(hoursRaw) : 0;
    const parsedMinutes = minutesRaw ? Number(minutesRaw) : 0;

    if (isNaN(parsedHours) || parsedHours < 0 || !Number.isInteger(parsedHours)) {
      errors.sleep = "Sleep hours must be a whole number between 0 and 23.";
    } else if (parsedHours > 23) {
      errors.sleep = "Sleep hours cannot exceed 23 when specifying minutes.";
    } else if (
      isNaN(parsedMinutes) ||
      parsedMinutes < 0 ||
      parsedMinutes > 59 ||
      !Number.isInteger(parsedMinutes)
    ) {
      errors.sleep = "Sleep minutes must be a whole number between 0 and 59.";
    } else {
      totalSleepHours = Math.round((parsedHours + parsedMinutes / 60) * 100) / 100;
      if (totalSleepHours < 2.0 || totalSleepHours > 16.0) {
        errors.sleep = "Please enter sleep duration between 2 and 16 hours.";
      }
    }
  }

  // 3. Sleep Score Validation (Optional)
  let parsedSleepScore: number | null = null;
  const scoreRaw =
    input.sleepScore !== undefined && input.sleepScore !== null
      ? String(input.sleepScore).trim()
      : "";

  if (scoreRaw !== "") {
    const num = Number(scoreRaw);
    if (isNaN(num)) {
      errors.sleepScore = "Sleep score must be a number between 0 and 100.";
    } else if (num < 0 || num > 100) {
      errors.sleepScore = "Sleep score must be between 0 and 100.";
    } else {
      parsedSleepScore = Math.round(num * 10) / 10;
    }
  }

  // 4. HRV Validation (Required)
  let parsedHrv = 0;
  const hrvRaw = String(input.hrv ?? "").trim();
  if (!hrvRaw) {
    errors.hrv = "Please enter your morning HRV.";
  } else {
    const num = Number(hrvRaw);
    if (isNaN(num)) {
      errors.hrv = "HRV must be a valid number.";
    } else if (num < 10 || num > 250) {
      errors.hrv = "Please enter an HRV between 10 and 250 ms.";
    } else {
      parsedHrv = Math.round(num * 10) / 10;
    }
  }

  // 5. Resting HR Validation (Required)
  let parsedRestingHr = 0;
  const rhrRaw = String(input.restingHr ?? "").trim();
  if (!rhrRaw) {
    errors.restingHr = "Please enter your resting heart rate.";
  } else {
    const num = Number(rhrRaw);
    if (isNaN(num)) {
      errors.restingHr = "Resting heart rate must be a valid number.";
    } else if (num < 35 || num > 130) {
      errors.restingHr = "Please enter a resting heart rate between 35 and 130 bpm.";
    } else {
      parsedRestingHr = Math.round(num * 10) / 10;
    }
  }

  // 6. Activity Load Validation (Required)
  const validLoads = ["low", "moderate", "high"];
  const loadNormalized = (input.activityLoad || "").toLowerCase().trim();
  if (!loadNormalized || !validLoads.includes(loadNormalized)) {
    errors.activityLoad = "Please select yesterday's activity load (Low, Moderate, or High).";
  }

  // 7. Notes Validation (Optional)
  let sanitizedNotes: string | null = null;
  if (input.notes) {
    const trimmedNotes = input.notes.trim();
    if (trimmedNotes.length > 500) {
      errors.notes = "Notes must not exceed 500 characters.";
    } else if (trimmedNotes.length > 0) {
      sanitizedNotes = trimmedNotes;
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedData: isValid
      ? {
          date: trimmedDate,
          sleep_hours: totalSleepHours,
          sleep_score: parsedSleepScore,
          hrv: parsedHrv,
          resting_hr: parsedRestingHr,
          activity_load: loadNormalized as "low" | "moderate" | "high",
          notes: sanitizedNotes,
        }
      : undefined,
  };
}

/**
 * Maps raw database and network errors to friendly user-facing messages for daily metrics.
 */
export function formatDailyMetricsError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  const lower = rawMessage.toLowerCase();

  if (
    lower.includes("23505") ||
    lower.includes("unique") ||
    lower.includes("uq_daily_metrics_user_date")
  ) {
    return "An entry already exists for this date. You can edit the existing entry.";
  }

  if (lower.includes("network request failed") || lower.includes("fetch failed")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (
    lower.includes("row level security") ||
    lower.includes("row-level security") ||
    lower.includes("rls")
  ) {
    return "You do not have permission to modify these recovery metrics.";
  }

  if (lower.includes("check constraint") || lower.includes("violates check")) {
    return "One or more metrics are outside the accepted range. Please review your entries.";
  }

  return rawMessage || "Failed to save recovery metrics. Please try again.";
}

