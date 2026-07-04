import { createClient } from "@supabase/supabase-js";
import type { Database } from "@alrehla/types";

// استخدام environment variables - لا تستخدم hardcoded values
const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
const VITE_SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// التحقق من وجود الـ credentials
if (!SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
  );
}

// إنشاء العميل الرئيسي
export const supabase = createClient<Database>(
  SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/**
 * عميل مؤقت لا يحفظ الجلسة في المتصفح
 * يستخدم لإنشاء حسابات فرعية (مثل الطلاب) دون تسجيل خروج ولي الأمر
 */
export const getTemporaryClient = () => {
  return createClient<Database>(SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export const hasSupabaseCredentials = () => {
  return !!SUPABASE_URL && !!VITE_SUPABASE_PUBLISHABLE_KEY;
};
