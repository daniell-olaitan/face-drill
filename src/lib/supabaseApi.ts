// Calls the Supabase Edge Functions that back the app. Both values are public
// (the anon key is browser-safe and ships in the bundle), so they default to the
// project's values and the build works with no env config. Set VITE_SUPABASE_URL
// and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) to override.

const DEFAULT_SUPABASE_URL = "https://tbuaxywxkiyodvoihrhn.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidWF4eXd4a2l5b2R2b2locmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzM3NjQsImV4cCI6MjA5Nzk0OTc2NH0.lqkJ3nUDqByjtvEaeL1m8QQnw_F_718GnuGeYfABpd4";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? DEFAULT_SUPABASE_URL;
// Accept either name: Supabase/Lovable call this the "anon" or "publishable" key.
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  DEFAULT_SUPABASE_ANON_KEY;

/** Absolute URL of an Edge Function, e.g. functionUrl("report"). */
export function functionUrl(name: string): string {
  return `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/${name}`;
}

/** Headers for an Edge Function call (JSON + the public anon key). */
export function functionHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (SUPABASE_ANON_KEY) {
    headers.apikey = SUPABASE_ANON_KEY;
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  return headers;
}
