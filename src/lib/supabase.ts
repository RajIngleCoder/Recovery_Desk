import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import { Database } from "../types/database";

const supabaseUrl = env.supabaseUrl || "https://placeholder-project.supabase.co";
const supabaseAnonKey = env.supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
