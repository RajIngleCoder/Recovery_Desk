import { supabase } from "@/lib/supabase";
import { DailyMetricRow, RecommendationRow, Database } from "@/types/database";

export const recoveryService = {
  /**
   * Fetch daily metrics for a specific date.
   */
  async getDailyMetricsForDate(
    userId: string,
    date: string
  ): Promise<DailyMetricRow | null> {
    try {
      const { data, error } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();

      if (error) {
        console.warn("[recoveryService] getDailyMetricsForDate error:", error.message);
        return null;
      }

      return data as DailyMetricRow | null;
    } catch (err) {
      console.warn("[recoveryService] getDailyMetricsForDate exception:", err);
      return null;
    }
  },

  /**
   * Fetch historical daily metrics up to `days` prior, ordered newest first.
   */
  async getRecentMetrics(
    userId: string,
    days = 14
  ): Promise<DailyMetricRow[]> {
    try {
      const { data, error } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(days);

      if (error) {
        console.warn("[recoveryService] getRecentMetrics error:", error.message);
        return [];
      }

      return (data || []) as DailyMetricRow[];
    } catch (err) {
      console.warn("[recoveryService] getRecentMetrics exception:", err);
      return [];
    }
  },

  /**
   * Save (insert or upsert) daily metrics for a user and date.
   */
  async saveDailyMetrics(
    entry: Database["public"]["Tables"]["daily_metrics"]["Insert"]
  ): Promise<{ data: DailyMetricRow | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("daily_metrics")
        .upsert(entry, { onConflict: "user_id,date" })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as DailyMetricRow };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Failed to save recovery metrics",
      };
    }
  },

  /**
   * Fetch a single daily metric entry by ID.
   */
  async getDailyMetricById(id: string): Promise<DailyMetricRow | null> {
    try {
      const { data, error } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.warn("[recoveryService] getDailyMetricById error:", error.message);
        return null;
      }

      return data as DailyMetricRow | null;
    } catch (err) {
      console.warn("[recoveryService] getDailyMetricById exception:", err);
      return null;
    }
  },

  /**
   * Delete a metric entry by ID.
   */
  async deleteDailyMetric(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("daily_metrics")
        .delete()
        .eq("id", id);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete metric entry",
      };
    }
  },

  /**
   * Delete a metric entry by user ID and date.
   */
  async deleteDailyMetricByDate(
    userId: string,
    date: string
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("daily_metrics")
        .delete()
        .eq("user_id", userId)
        .eq("date", date);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete metric entry",
      };
    }
  },

  /**
   * Fetch recommendation for a specific date.
   */
  async getRecommendationForDate(
    userId: string,
    date: string
  ): Promise<RecommendationRow | null> {
    try {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();

      if (error) {
        return null;
      }

      return data as RecommendationRow | null;
    } catch {
      return null;
    }
  },

  /**
   * Save (insert or upsert) recommendation for a user and date.
   */
  async saveRecommendation(
    rec: Database["public"]["Tables"]["recommendations"]["Insert"]
  ): Promise<{ data: RecommendationRow | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("recommendations")
        .upsert(rec, { onConflict: "user_id,date" })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as RecommendationRow };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Failed to save recommendation",
      };
    }
  },

  /**
   * Fetch recent recommendations up to `days` prior, ordered newest first.
   */
  async getRecentRecommendations(
    userId: string,
    days = 30
  ): Promise<RecommendationRow[]> {
    try {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(days);

      if (error) {
        console.warn("[recoveryService] getRecentRecommendations error:", error.message);
        return [];
      }

      return (data || []) as RecommendationRow[];
    } catch (err) {
      console.warn("[recoveryService] getRecentRecommendations exception:", err);
      return [];
    }
  },

  /**
   * Delete a recommendation entry by user ID and date.
   */
  async deleteRecommendationByDate(
    userId: string,
    date: string
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("recommendations")
        .delete()
        .eq("user_id", userId)
        .eq("date", date);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete recommendation",
      };
    }
  },
};
