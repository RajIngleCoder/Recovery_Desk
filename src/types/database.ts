export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GoalType = "general" | "training" | "fitness";
export type ActivityLoadType = "low" | "moderate" | "high";
export type RecoveryStatusType = "PUSH" | "MODERATE" | "RECOVER";

export interface ProfileRow {
  id: string;
  display_name: string | null;
  goal: GoalType | null;
  sleep_target_hours: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyMetricRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  sleep_hours: number;
  sleep_score: number | null;
  hrv: number;
  resting_hr: number;
  activity_load: ActivityLoadType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecommendationRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  status: RecoveryStatusType;
  score: number;
  reason_data: Json;
  created_at: string;
}

export interface GenericRelationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          display_name?: string | null;
          goal?: GoalType | null;
          sleep_target_hours?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          goal?: GoalType | null;
          sleep_target_hours?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      daily_metrics: {
        Row: DailyMetricRow;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          sleep_hours: number;
          sleep_score?: number | null;
          hrv: number;
          resting_hr: number;
          activity_load: ActivityLoadType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          sleep_hours?: number;
          sleep_score?: number | null;
          hrv?: number;
          resting_hr?: number;
          activity_load?: ActivityLoadType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: GenericRelationship[];
      };
      recommendations: {
        Row: RecommendationRow;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          status: RecoveryStatusType;
          score: number;
          reason_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          status?: RecoveryStatusType;
          score?: number;
          reason_data?: Json;
          created_at?: string;
        };
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
