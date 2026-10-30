import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "[Supabase] Environment variables missing on client! If you just created .env, please restart 'npm run dev'."
  );
}

// Fallback placeholder prevents Next.js SSG / build-time crashes if env is absent
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
