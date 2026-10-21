import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ProfileRow } from "@/types/database";
import { profileService } from "@/services/profileService";
import { authService, AuthResponse } from "@/services/authService";

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  requiresEmailVerification: boolean;
  error?: string;
}

export interface SignInResult {
  user: User | null;
  session: Session | null;
  error?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isProfileLoaded: boolean;
  profileError: string | null;
  signIn: (email: string, pass: string) => Promise<SignInResult>;
  signUp: (email: string, pass: string, displayName?: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      setProfile(userProfile);
      setIsProfileLoaded(true);
      setProfileError(null);
    } catch (err: any) {
      console.warn("[AuthProvider] Error fetching profile:", err);
      setProfileError(err?.message || "Failed to load profile");
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session load
    authService
      .getSession()
      .then(async (initialSession) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await loadProfile(initialSession.user.id);
        }
      })
      .catch((err) => {
        console.warn("[AuthProvider] Initial session fetch failed:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // 2. Real-time auth subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsProfileLoaded(false);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, pass: string): Promise<SignInResult> => {
    const result = await authService.signIn(email, pass);
    if (result.session) {
      setSession(result.session);
      setUser(result.user);
      if (result.user) {
        await loadProfile(result.user.id);
      }
    }
    return result;
  };

  const signUp = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<SignUpResult> => {
    const result = await authService.signUp(email, pass, displayName);
    const requiresVerification = Boolean(result.user && !result.session);

    if (result.session) {
      setSession(result.session);
      setUser(result.user);
      if (result.user) {
        await loadProfile(result.user.id);
      }
    }

    return {
      user: result.user,
      session: result.session,
      requiresEmailVerification: requiresVerification,
      error: result.error,
    };
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsProfileLoaded(false);
      setProfileError(null);
    }
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isProfileLoaded,
        profileError,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
