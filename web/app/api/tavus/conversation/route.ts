import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createMockConversation } from "@/lib/tavus/mock";
import { getVisaProfile } from "@/lib/visa-profiles";
import { buildOfficerSystemPrompt } from "@/lib/ai/prompts";
import type { ApiResponse, TavusConversation, SessionContext } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Login is optional while accounts (Supabase) are disabled: a guest can
    // start a practice interview. Re-tighten by removing the catch if auth
    // becomes required again.
    try {
      await requireUser();
    } catch {
      /* guest mode */
    }

    const body = (await request.json()) as {
      visa_profile_id?: string;
      context?: SessionContext;
      conversation_name?: string;
      conversational_context?: string;
    };

    const tavusApiKey = process.env.TAVUS_API_KEY;

    // Default path during dev / before launch: never touches Tavus, burns no minutes.
    if (!tavusApiKey || process.env.NEXT_PUBLIC_TAVUS_MOCK === "true") {
      return NextResponse.json<ApiResponse<TavusConversation>>({
        data: createMockConversation({ visaProfileId: body.visa_profile_id }),
        error: null,
      });
    }

    const replicaId = process.env.TAVUS_REPLICA_ID;
    const personaId = process.env.TAVUS_PERSONA_ID;
    if (!replicaId || !personaId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: { code: "TAVUS_CONFIG", message: "Tavus replica/persona not configured." },
        },
        { status: 500 }
      );
    }

    // Build the officer's per-conversation briefing from the applicant's DS-160.
    let conversationalContext = body.conversational_context;
    if (!conversationalContext && body.visa_profile_id && body.context) {
      const profile = getVisaProfile(body.visa_profile_id);
      if (profile) conversationalContext = buildOfficerSystemPrompt(profile, body.context);
    }

    const res = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": tavusApiKey },
      body: JSON.stringify({
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name: body.conversation_name ?? "VisaDrill interview",
        conversational_context: conversationalContext,
        properties: {
          max_call_duration: 120, // TEST-SAFE cap (2 min) so a stuck/abandoned
          // session can't bleed minutes. Raise toward 300-420 before real interviews.
          participant_left_timeout: 30, // end shortly after the applicant leaves
          enable_recording: false,
          language: "english",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[tavus/conversation]", err);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "TAVUS_ERROR", message: "Failed to create Tavus conversation." } },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      conversation_id: string;
      conversation_url: string;
      status: string;
      replica_id: string;
      persona_id: string;
      created_at: string;
    };

    const conversation: TavusConversation = {
      conversation_id: json.conversation_id,
      conversation_url: json.conversation_url,
      status: "active",
      replica_id: json.replica_id ?? replicaId,
      persona_id: json.persona_id ?? personaId,
      created_at: json.created_at ?? new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<TavusConversation>>({ data: conversation, error: null });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
