// Mock AsyncStorage for Node/Jest unit test environment
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Provide test environment variables if not populated
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://oxafqrqtsfjlfwdzoujq.supabase.co";
}
if (!process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
}
