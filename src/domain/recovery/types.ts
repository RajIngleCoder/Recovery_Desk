import { ActivityLoadType, RecoveryStatusType, GoalType } from "@/types/database";

export type BaselineStatus = "learning" | "established";

export interface RecoveryInput {
  hrv: number;
  restingHr: number;
  sleepHours: number;
  activityLoad: ActivityLoadType;
  hrvBaseline?: number;
  restingHrBaseline?: number;
  sleepBaseline?: number;
  goal?: GoalType;
}

export interface RecoveryFactor {
  metric: "hrv" | "resting_hr" | "sleep" | "activity_load";
  label: string;
  currentValue: number | string;
  baselineValue?: number | string;
  deviation: string;
  sentiment: "positive" | "neutral" | "negative";
  description: string;
  impactLabel?: string;
}


export interface TodayPlan {
  headline: string;
  training: string;
  movement: string;
  recovery: string;
}


export interface PointsContribution {
  hrv: number;
  restingHr: number;
  sleep: number;
  activityLoad: number;
  total: number;
}

export interface RecoveryDecision {
  status: RecoveryStatusType;
  score: number;
  title: string;
  body: string;
  action: string;
  plan?: TodayPlan;
  pointsBreakdown?: PointsContribution;
  readinessTier?: string;
  reason: string;
  baselineStatus: BaselineStatus;
  factors: RecoveryFactor[];
  calculatedAt: string;
}

export interface MetricCounts {
  hrv: number;
  restingHr: number;
  sleep: number;
}

export interface BaselineCalculationResult {
  hrvBaseline: number | null;
  restingHrBaseline: number | null;
  sleepBaseline: number | null;
  dataCount: number;
  status: BaselineStatus;
  metricCounts?: MetricCounts;
  provisional?: {
    hrvBaseline: number | null;
    restingHrBaseline: number | null;
    sleepBaseline: number | null;
  };
}
