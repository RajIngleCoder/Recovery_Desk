import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { formatAuthError } from "@/lib/validation";

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

export const authService = {
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("[authService] getSession error:", error.message);
        return null;
      }
      return data.session;
    } catch (err) {
      console.warn("[authService] getSession exception:", err);
      return null;
    }
  },

  async signUp(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName?.trim() || undefined,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: formatAuthError(error) };
      }

      return { user: data.user, session: data.session };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: formatAuthError(err),
      };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, session: null, error: formatAuthError(error) };
      }

      return { user: data.user, session: data.session };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: formatAuthError(err),
      };
    }
  },

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err) {
      return {
        error: formatAuthError(err),
      };
    }
  },

  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        return { error: formatAuthError(error) };
      }
      return {};
    } catch (err) {
      return {
        error: formatAuthError(err),
      };
    }
  },
};
