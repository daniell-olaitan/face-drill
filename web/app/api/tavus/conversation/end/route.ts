import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

/**
 * Ends a live Tavus conversation so it stops consuming trial minutes the
 * instant the user leaves - instead of running until `participant_left_timeout`
 * or the `max_call_duration` cap. Called from "End Interview" and as a
 * tab-close / navigate-away safety net (via sendBeacon).
 */
export async function POST(request: NextRequest) {
  try {
    // Login is optional while accounts (Supabase) are disabled (guest mode).
    try {
      await requireUser();
    } catch {
      /* guest mode */
    }

    const { conversation_id } = (await request.json()) as { conversation_id?: string };
    const tavusApiKey = process.env.TAVUS_API_KEY;

    // Nothing to end in mock mode, without a key, or without a real conversation.
    if (!conversation_id || !tavusApiKey || process.env.NEXT_PUBLIC_TAVUS_MOCK === "true") {
      return NextResponse.json<ApiResponse<{ ended: boolean }>>({
        data: { ended: false },
        error: null,
      });
    }

    const res = await fetch(
      `https://tavusapi.com/v2/conversations/${conversation_id}/end`,
      { method: "POST", headers: { "x-api-key": tavusApiKey } }
    );

    // An already-ended or unknown conversation (404) is fine - the goal, no more
    // billing, is satisfied either way. Only surface genuine failures.
    if (!res.ok && res.status !== 404) {
      console.error("[tavus/conversation/end]", await res.text());
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "TAVUS_END_ERROR", message: "Failed to end Tavus conversation." } },
        { status: 502 }
      );
    }

    return NextResponse.json<ApiResponse<{ ended: boolean }>>({
      data: { ended: true },
      error: null,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
