import { NextRequest, NextResponse } from "next/server";
import { createClient, requireUser } from "@/lib/supabase/server";
import type { ApiResponse, Message } from "@/types";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]/messages">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: session } = await supabase
      .from("sessions")
      .select("id, user_id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NOT_FOUND", message: "Session not found." } },
        { status: 404 }
      );
    }

    if (session.status === "completed" || session.status === "abandoned") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "SESSION_CLOSED", message: "Cannot add messages to a closed session." } },
        { status: 400 }
      );
    }

    const body = await request.json() as {
      speaker: string;
      text: string;
      timestamp_ms: number;
      question_category_id?: string;
    };

    const validSpeakers = ["officer", "applicant", "system"];
    if (!body.speaker || !validSpeakers.includes(body.speaker) || !body.text?.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_BODY", message: "speaker and text are required." } },
        { status: 400 }
      );
    }

    const MAX_TEXT = 5000;
    if (body.text.length > MAX_TEXT) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "TEXT_TOO_LONG", message: `Message exceeds ${MAX_TEXT} characters.` } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        session_id: id,
        speaker: body.speaker,
        text: body.text.trim(),
        timestamp_ms: body.timestamp_ms ?? 0,
        question_category_id: body.question_category_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[messages:POST]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INSERT_FAILED", message: "Could not save message." } },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Message>>({ data, error: null }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
