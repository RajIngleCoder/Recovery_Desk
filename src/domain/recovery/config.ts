/**
 * RECOVERY_CONFIG
 * 
 * IMPORTANT:
 * These thresholds and weights are product experimentation hypotheses for wellness
 * decision-support, NOT clinically validated medical diagnostic thresholds.
 */
export const RECOVERY_CONFIG = {
  // Baseline observation requirement
  minBaselineObservations: 2,
  baselineWindowDays: 14,

  // Weightings for composite recovery score (must sum to 1.0)
  weights: {
    hrv: 0.40,
    rhr: 0.30,
    sleep: 0.20,
    activityLoad: 0.10,
  },

  // HRV thresholds (% deviation from baseline)
  hrv: {
    excellent: 5,     // >= +5% vs baseline -> full score
    normal: -5,       // -5% to +5% -> normal range
    mildDeficit: -15, // -15% to -5% -> moderate deduction
    severeDeficit: -15, // < -15% -> heavy deduction
  },

  // Resting Heart Rate thresholds (bpm deviation from baseline)
  rhr: {
    optimal: -1,      // <= -1 bpm below baseline
    normal: 2,        // <= +2 bpm above baseline
    mildElevated: 5,  // +3 to +5 bpm above baseline
    elevated: 5,      // > +5 bpm above baseline
  },

  // Sleep deficit thresholds (hours deviation from baseline)
  sleep: {
    surplus: 0.5,      // >= +0.5h over baseline
    normal: -0.5,      // within 30m of baseline
    mildDeficit: -1.5, // 30m to 1.5h deficit
    severeDeficit: -1.5, // > 1.5h deficit
  },

  // Activity Load impact on recovery readiness
  activityLoadPenalty: {
    low: 0,
    moderate: 5,
    high: 15,
  },

  // Final Decision Cutoffs (Score between 0 and 100)
  statusThresholds: {
    push: 85,         // Score >= 85 => PUSH
    moderate: 60,     // 60 <= Score < 85 => MODERATE; Score < 60 => RECOVER
  },
  // Centralized recommendation copy templates
  copy: {
    push: {
      title: "You're in a great spot today",
      body: "Your key recovery markers are close to or exceeding your recent baseline.",
      action: "Your body is responding well. A normal or high-intensity training day is well-supported if you feel ready.",
      plan: {
        headline: "You're well-rested and ready to push today.",
        training: "High intensity is reasonable (intervals, tempo, heavy lifting)",
        movement: "Normal to high daily physical activity",
        recovery: "Maintain your regular sleep routine",
      },
      plans: {
        training: {
          headline: "You're well-rested and ready to push today.",
          training: "High intensity is supported (intervals, tempo, heavy lifting)",
          movement: "Full athletic volume and active training load",
          recovery: "Maintain your standard recovery window",
        },
        fitness: {
          headline: "Great physical readiness to tackle your fitness routine.",
          training: "Complete your full planned workout with confidence",
          movement: "Aim for high daily movement (8,000–10,000+ steps)",
          recovery: "Stay consistent with your evening wind-down",
        },
        general: {
          headline: "High energy and vitality. Your system is fully recharged.",
          training: "Great capacity for active exercise or demanding physical tasks",
          movement: "Enjoy a vibrant, active day without fatigue",
          recovery: "Protect your normal sleep schedule tonight",
        },
      },
    },
    moderate: {
      title: "Keep today moderate",
      body: "Some of your recovery markers are slightly below your usual baseline range.",
      action: "Consider keeping intensity steady and moderate. Listen to your body and adjust if fatigue sets in.",
      plan: {
        headline: "Your body is ready for a normal day — not a max-effort day.",
        training: "Moderate intensity (steady aerobic, base, technique)",
        movement: "Normal movement and daily walking are fine",
        recovery: "Aim for your usual sleep window",
      },
      plans: {
        training: {
          headline: "Ready for steady work — not a max-effort day.",
          training: "Moderate intensity (steady aerobic, base build, technique)",
          movement: "Normal training volume; avoid chasing max-effort PRs today",
          recovery: "Aim for your standard sleep target",
        },
        fitness: {
          headline: "Balanced energy. Ideal for sticking to your daily routine.",
          training: "Complete your regular workout at steady, controlled effort",
          movement: "Hit your standard step goal and daily movement",
          recovery: "Wind down on schedule tonight",
        },
        general: {
          headline: "Balanced day. Good energy for work and regular routines.",
          training: "Keep workouts moderate; avoid adding unnecessary physical strain",
          movement: "Normal daily walking and light activity",
          recovery: "Prioritize your normal sleep window to stay balanced",
        },
      },
    },
    recover: {
      title: "Prioritize rest and recovery today",
      body: "Multiple recovery markers indicate your body needs extra time to recharge.",
      action: "Consider an easy recovery walk, light stretching, or an active rest day to recharge your system.",
      plan: {
        headline: "Your recovery signals are below your normal range. Keep today light and prioritize recovery.",
        training: "Light or active recovery only (mobility, stretching, easy walk)",
        movement: "Keep physical load light",
        recovery: "Prioritize sleep & an early wind-down tonight",
      },
      plans: {
        training: {
          headline: "Elevated fatigue. A lower-intensity day helps avoid adding unnecessary strain.",
          training: "Light or active recovery only (mobility, foam roll, easy walk)",
          movement: "Keep physical load light to help manage training fatigue",
          recovery: "Prioritize sleep and an early wind-down tonight",
        },
        fitness: {
          headline: "Your body needs rest. Prioritize recharging over heavy workouts.",
          training: "Take an active rest day, light stretch, or restorative yoga",
          movement: "Gentle walking only; avoid pushing through deep fatigue",
          recovery: "Add a 30-minute buffer to your sleep tonight",
        },
        general: {
          headline: "Energy reserves are low. Focus on rest and stress reduction.",
          training: "Rest day recommended; skip intense physical exertion",
          movement: "Gentle walks and fresh air throughout the day",
          recovery: "Prioritize an early bedtime and relaxation",
        },
      },
    },
    learning: {
      title: "Recovery data logged",
      body: "We're still learning your normal baseline range.",
      action: "Add a few more days of data to establish your personalized baseline.",
      plan: {
        headline: "Establishing your personal rolling baseline.",
        training: "Train by feel while we learn your norms",
        movement: "Standard daily activity",
        recovery: "Focus on consistent sleep timing",
      },
      plans: {
        training: {
          headline: "Establishing your personal rolling baseline.",
          training: "Train by feel while we calibrate your personal athletic range",
          movement: "Follow your normal training plan",
          recovery: "Focus on consistent sleep timing",
        },
        fitness: {
          headline: "Establishing your personal rolling baseline.",
          training: "Listen to your body while your baseline learns",
          movement: "Stay consistent with daily steps and active habits",
          recovery: "Aim for your target sleep hours",
        },
        general: {
          headline: "Establishing your personal rolling baseline.",
          training: "Stay active at comfortable effort while data gathers",
          movement: "Maintain regular daily routines",
          recovery: "Keep a regular sleep schedule",
        },
      },
    },
  },
} as const;
