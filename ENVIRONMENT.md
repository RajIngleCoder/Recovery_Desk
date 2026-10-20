# Recovery Desk — Environment Configuration

## 1. Overview

Recovery Desk requires Supabase credentials for user authentication and PostgreSQL database queries. In Expo and React Native applications, variables exposed to the mobile bundle must be prefixed with `EXPO_PUBLIC_`.

---

## 2. Required Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Project URL (found in Supabase Dashboard > Project Settings > API)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Publishable / Anon Public Key (found in Supabase Dashboard > Project Settings > API)
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

---

## 3. Strict Security Rules

> [!CAUTION]
> **NEVER BUNDLE THE SERVICE ROLE KEY IN THE MOBILE APP**
>
> The Supabase `service_role` key bypasses all Row Level Security (RLS) policies and provides unrestricted administrator access to your entire database. Exposing it in a client application allows any user or reverse engineer to read, modify, and delete every record in your database.
>
> **Only use the `anon` / `publishable` public key in `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.**

- Never commit `.env` or files containing secret values to git.
- Always ensure `.gitignore` contains `.env`, `.env.local`, and `*.env`.
- An example template file `.env.example` is committed to version control with placeholder values.

---

## 4. Environment Template (`.env.example`)

```env
# Recovery Desk — Mobile App Environment Template
# Replace these with your Supabase project credentials

EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

---

## 5. Validating Environment Variables at Runtime

In `src/lib/supabase.ts`, variables are validated at app startup:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
  );
}
```
If either key is omitted, the application immediately throws a clear, actionable error rather than failing silently with undefined network requests.
