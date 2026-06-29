// Lightweight liveness endpoint. Point a daily uptime ping at it so the free
// Supabase project does not auto-pause after a week of inactivity. It spends no
// provider minutes; it runs one trivial query so the database compute (not just
// the edge runtime) registers as active.

import { json, preflight } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let db = "skipped";
  if (supabaseUrl && serviceKey) {
    try {
      const res = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/waitlist?select=id&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      db = res.ok ? "ok" : `error ${res.status}`;
    } catch {
      db = "unreachable";
    }
  }

  return json({ ok: true, db });
});
