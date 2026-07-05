import { createClient } from "@supabase/supabase-js";
import type { Database } from "@alrehla/types";

declare const process: { env?: Record<string, string | undefined> } | undefined;

type PublicEnv = Record<string, string | undefined>;

const SUPABASE_URL =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
  ((import.meta as any).env?.VITE_SUPABASE_URL) ||
  "";
const SUPABASE_PUBLISHABLE_KEY =
  (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : undefined) ||
  ((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  "";

  
const hasConfiguredSupabaseCredentials = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
const EFFECTIVE_SUPABASE_URL = SUPABASE_URL || "https://placeholder.supabase.co";
const EFFECTIVE_SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

if (!hasConfiguredSupabaseCredentials) {
  console.warn(
    "⚠️ Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or Vite equivalents).",
  );
}

export const supabase = createClient<Database>(
  EFFECTIVE_SUPABASE_URL,
  EFFECTIVE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const getTemporaryClient = () => {
  return createClient<Database>(EFFECTIVE_SUPABASE_URL, EFFECTIVE_SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export const hasSupabaseCredentials = () => {
  return hasConfiguredSupabaseCredentials;
};
