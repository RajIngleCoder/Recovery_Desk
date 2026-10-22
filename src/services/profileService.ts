import { supabase } from "@/lib/supabase";
import { ProfileRow, Database } from "@/types/database";

export const profileService = {
  async getProfile(userId: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Record might not exist yet if signup trigger hasn't fired
        return null;
      }

      return data as ProfileRow;
    } catch {
      return null;
    }
  },

  async upsertProfile(
    profile: Database["public"]["Tables"]["profiles"]["Insert"]
  ): Promise<{ profile: ProfileRow | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profile)
        .select()
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      return { profile: data as ProfileRow };
    } catch (err) {
      return {
        profile: null,
        error: err instanceof Error ? err.message : "Failed to update profile",
      };
    }
  },

  async completeOnboarding(
    userId: string,
    data: {
      displayName: string;
      goal: ProfileRow["goal"];
      sleepTargetHours: number;
    }
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          display_name: data.displayName,
          goal: data.goal,
          sleep_target_hours: data.sleepTargetHours,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to complete onboarding",
      };
    }
  },
  async deleteAccount(): Promise<{ error?: string }> {
    try {
      // Calls Postgres RPC function running with SECURITY DEFINER
      // Deletes user from auth.users WHERE id = auth.uid()
      // Cascades automatically to profiles, daily_metrics, and recommendations
      const { error } = await supabase.rpc("delete_user_account");
      if (error) {
        console.warn("[profileService] deleteAccount RPC error:", error.message);
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete account",
      };
    }
  },
};
