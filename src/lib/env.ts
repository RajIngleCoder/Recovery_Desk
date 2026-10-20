export interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-supabase-project") &&
  !supabaseAnonKey.includes("your-supabase-anon-key")
);

if (!isConfigured) {
  console.warn(
    "[Recovery Desk] Supabase credentials are missing or set to placeholder values. Update your .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
  );
}

export const env: AppEnv = {
  supabaseUrl,
  supabaseAnonKey,
  isConfigured,
};
