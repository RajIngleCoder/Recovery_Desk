import {
  validateEmail,
  validatePassword,
  validateSignUp,
  validateSignIn,
  validateDisplayName,
  validateOnboarding,
  formatAuthError,
  validateDailyMetricsInput,
  formatDailyMetricsError,
} from "../validation";

describe("Validation & Auth Error Formatting", () => {
  describe("validateEmail", () => {
    it("accepts valid email addresses", () => {
      expect(validateEmail("athlete@example.com").isValid).toBe(true);
      expect(validateEmail("user.name+recovery@domain.co.uk").isValid).toBe(true);
      expect(validateEmail("runner123@sub.domain.org").isValid).toBe(true);
    });

    it("rejects empty or whitespace emails", () => {
      const res = validateEmail("   ");
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Please enter your email address.");
    });

    it("rejects malformed email addresses and dummy single-character accounts", () => {
      expect(validateEmail("invalid-email").isValid).toBe(false);
      expect(validateEmail("user@").isValid).toBe(false);
      expect(validateEmail("@domain.com").isValid).toBe(false);
      expect(validateEmail("user@domain").isValid).toBe(false);
      expect(validateEmail("1@gmail.com").isValid).toBe(false);
      expect(validateEmail("12@gmail.com").isValid).toBe(false);
      expect(validateEmail("a@domain.com").isValid).toBe(false);
      expect(validateEmail(".user@domain.com").isValid).toBe(false);
      expect(validateEmail("user..name@domain.com").isValid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("accepts passwords with 8 or more characters", () => {
      expect(validatePassword("secret123").isValid).toBe(true);
      expect(validatePassword("12345678").isValid).toBe(true);
    });

    it("rejects empty or whitespace-only passwords", () => {
      expect(validatePassword("").isValid).toBe(false);
      expect(validatePassword("        ").isValid).toBe(false);
      expect(validatePassword("").error).toBe("Please enter your password.");
    });

    it("rejects passwords shorter than 8 characters", () => {
      const res = validatePassword("1234567");
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Password must be at least 8 characters long.");
    });

    it("rejects passwords longer than 72 characters", () => {
      const longPass = "a".repeat(73);
      const res = validatePassword(longPass);
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Password must not exceed 72 characters.");
    });
  });

  describe("validateSignUp", () => {
    it("validates successful sign up form", () => {
      const res = validateSignUp({
        email: "test@example.com",
        password: "securepassword",
        confirmPassword: "securepassword",
        displayName: "Test User",
      });
      expect(res.isValid).toBe(true);
    });

    it("flags mismatched passwords", () => {
      const res = validateSignUp({
        email: "test@example.com",
        password: "securepassword",
        confirmPassword: "differentpassword",
      });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Passwords do not match.");
    });

    it("flags invalid email during signup", () => {
      const res = validateSignUp({
        email: "bademail",
        password: "securepassword",
        confirmPassword: "securepassword",
      });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Please enter a valid email address.");
    });
  });

  describe("validateSignIn", () => {
    it("validates successful sign in form", () => {
      const res = validateSignIn({
        email: "user@example.com",
        password: "mypassword",
      });
      expect(res.isValid).toBe(true);
    });

    it("flags missing password", () => {
      const res = validateSignIn({
        email: "user@example.com",
        password: "",
      });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Please enter your password.");
    });
  });

  describe("formatAuthError", () => {
    it("formats invalid login credentials into calm guidance", () => {
      const formatted = formatAuthError("Invalid login credentials");
      expect(formatted).toBe(
        "The email or password you entered is incorrect. Please verify your details."
      );
    });

    it("formats existing user error into helpful prompt", () => {
      const formatted = formatAuthError("User already registered");
      expect(formatted).toBe(
        "An account with this email address already exists. Please sign in instead."
      );
    });

    it("formats network failure into actionable message", () => {
      const formatted = formatAuthError("Network request failed");
      expect(formatted).toBe(
        "Unable to connect to the server. Please check your internet connection."
      );
    });

    it("formats unconfirmed email warning", () => {
      const formatted = formatAuthError("Email not confirmed");
      expect(formatted).toContain("Please confirm your email address");
    });

    it("falls back gracefully for unknown errors", () => {
      const formatted = formatAuthError(null);
      expect(formatted).toBe("An unexpected error occurred. Please try again.");
    });
  });


  describe("validateDisplayName", () => {
    it("accepts valid names", () => {
      expect(validateDisplayName("Sarah").isValid).toBe(true);
      expect(validateDisplayName("Runner 01").isValid).toBe(true);
      expect(validateDisplayName("").isValid).toBe(true); // optional
      expect(validateDisplayName(undefined).isValid).toBe(true);
    });

    it("rejects names with fewer than 2 alphanumeric characters", () => {
      expect(validateDisplayName("A").isValid).toBe(false);
      expect(validateDisplayName("!").isValid).toBe(false);
      expect(validateDisplayName("   ").isValid).toBe(false);
    });

    it("rejects names containing only zero-width or invisible spaces", () => {
      const res = validateDisplayName("​‌‍﻿");
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("Please enter a valid display name.");
    });
  });

  describe("validateOnboarding - European comma decimal parsing", () => {
    it("accepts comma decimal separator (7,5 -> 7.5 hours)", () => {
      const res = validateOnboarding({
        displayName: "Sarah",
        goal: "training",
        sleepTargetHours: "7,5",
      });
      expect(res.isValid).toBe(true);
    });

    it("rejects invalid display name in onboarding", () => {
      const res = validateOnboarding({
        displayName: "​",
        goal: "training",
        sleepTargetHours: "8.0",
      });
      expect(res.isValid).toBe(false);
    });
  });

  describe("validateDailyMetricsInput", () => {
    const today = "2026-09-21";

    it("validates a fully populated valid daily check-in", () => {
      const result = validateDailyMetricsInput(
        {
          date: "2026-09-21",
          sleepHours: "7",
          sleepMinutes: "30",
          sleepScore: "85",
          hrv: "55",
          restingHr: "58",
          activityLoad: "moderate",
          notes: "Felt strong during morning workout.",
        },
        today
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toEqual({
        date: "2026-09-21",
        sleep_hours: 7.5,
        sleep_score: 85,
        hrv: 55,
        resting_hr: 58,
        activity_load: "moderate",
        notes: "Felt strong during morning workout.",
      });
    });

    it("validates when optional fields (sleep score and notes) are omitted", () => {
      const result = validateDailyMetricsInput(
        {
          date: "2026-09-21",
          sleepHours: 8,
          sleepMinutes: 0,
          hrv: 60,
          restingHr: 50,
          activityLoad: "low",
        },
        today
      );

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.sleep_score).toBeNull();
      expect(result.sanitizedData?.notes).toBeNull();
      expect(result.sanitizedData?.sleep_hours).toBe(8);
    });

    describe("Date boundaries", () => {
      it("rejects future dates", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-09-22",
            sleepHours: 8,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.date).toBe("Check-in date cannot be in the future.");
      });

      it("rejects dates older than 365 days", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2025-09-01",
            sleepHours: 8,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.date).toBe("Check-in date cannot be older than one year.");
      });

      it("rejects malformed date strings", () => {
        const result = validateDailyMetricsInput(
          {
            date: "invalid-date",
            sleepHours: 8,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.date).toBe("Date must be in YYYY-MM-DD format.");
      });
    });

    describe("Sleep duration boundaries", () => {
      it("accepts minimum boundary of 2.0 hours", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 2,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.sleep_hours).toBe(2.0);
      });

      it("accepts European decimal comma in sleep hours (7,5 -> 7.5 hours)", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: "7,5",
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData?.sleep_hours).toBe(7.5);
      });
      it("accepts boundary values in hours + minutes format", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 7,
            sleepMinutes: 45,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.sleep_hours).toBe(7.75);
      });

      it("rejects sleep duration under 2 hours", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 1,
            sleepMinutes: 30,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.sleep).toContain("between 2 and 16 hours");
      });

      it("accepts maximum boundary of 16.0 hours", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 16,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.sleep_hours).toBe(16.0);
      });

      it("rejects sleep duration over 16 hours", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 17,
            sleepMinutes: 0,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.sleep).toContain("between 2 and 16 hours");
      });

      it("rejects invalid minutes >= 60", () => {
        const result = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 7,
            sleepMinutes: 65,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.sleep).toContain("between 0 and 59");
      });
    });

    describe("Sleep score boundaries", () => {
      it("accepts valid sleep score (0-100)", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            sleepScore: 85,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData?.sleep_score).toBe(85);
      });

      it("accepts empty/omitted sleep score as null", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            sleepScore: undefined,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData?.sleep_score).toBeNull();
      });

      it("rejects sleep score < 0 or > 100", () => {
        const resLow = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            sleepScore: -5,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(resLow.isValid).toBe(false);

        const resHigh = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            sleepScore: 105,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(resHigh.isValid).toBe(false);
      });
    });

    describe("HRV boundaries", () => {
      it("accepts boundary values 10 and 250 ms", () => {
        const res10 = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 10,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res10.isValid).toBe(true);
        expect(res10.sanitizedData?.hrv).toBe(10);

        const res250 = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 250,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res250.isValid).toBe(true);
        expect(res250.sanitizedData?.hrv).toBe(250);
      });

      it("rejects HRV < 10 ms", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 5,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.hrv).toBe("Please enter an HRV between 10 and 250 ms.");
      });

      it("rejects HRV > 250 ms", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 255,
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.hrv).toBe("Please enter an HRV between 10 and 250 ms.");
      });

      it("rejects missing HRV", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: "",
            restingHr: 50,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.hrv).toBe("Please enter your morning HRV.");
      });
    });

    describe("Resting Heart Rate boundaries", () => {
      it("accepts boundary values 35 and 130 bpm", () => {
        const res35 = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 35,
            activityLoad: "low",
          },
          today
        );
        expect(res35.isValid).toBe(true);
        expect(res35.sanitizedData?.resting_hr).toBe(35);

        const res130 = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 130,
            activityLoad: "low",
          },
          today
        );
        expect(res130.isValid).toBe(true);
        expect(res130.sanitizedData?.resting_hr).toBe(130);
      });

      it("rejects resting HR < 35 bpm", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 20,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.restingHr).toBe("Please enter a resting heart rate between 35 and 130 bpm.");
      });

      it("rejects resting HR > 130 bpm", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 135,
            activityLoad: "low",
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.restingHr).toBe("Please enter a resting heart rate between 35 and 130 bpm.");
      });
    });

    describe("Activity load validation", () => {
      it("accepts low, moderate, high", () => {
        for (const load of ["low", "moderate", "high"] as const) {
          const res = validateDailyMetricsInput(
            {
              date: "2026-03-01",
              sleepHours: 8,
              hrv: 60,
              restingHr: 50,
              activityLoad: load,
            },
            today
          );
          expect(res.isValid).toBe(true);
          expect(res.sanitizedData?.activity_load).toBe(load);
        }
      });

      it("rejects invalid activity load", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 50,
            activityLoad: "extreme",
          },
          today
        );
        expect(res.isValid).toBe(false);
      });
    });

    describe("Notes validation", () => {
      it("accepts notes under 500 characters", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
            notes: "Felt strong today, good morning run.",
          },
          today
        );
        expect(res.isValid).toBe(true);
        expect(res.sanitizedData?.notes).toBe("Felt strong today, good morning run.");
      });

      it("rejects notes exceeding 500 characters", () => {
        const res = validateDailyMetricsInput(
          {
            date: "2026-03-01",
            sleepHours: 8,
            hrv: 60,
            restingHr: 50,
            activityLoad: "low",
            notes: "x".repeat(501),
          },
          today
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.notes).toContain("500 characters");
      });
    });
  });

  describe("formatDailyMetricsError", () => {
    it("handles unique constraint collision error", () => {
      const msg = formatDailyMetricsError({ message: "uq_daily_metrics_user_date violation" });
      expect(msg).toContain("already exists");
    });

    it("handles network failure error", () => {
      const msg = formatDailyMetricsError(new Error("Network request failed"));
      expect(msg).toContain("internet connection");
    });
  });
});
