import { NextRequest, NextResponse } from "next/server";
import { createClient, requireUser } from "@/lib/supabase/server";
import type { ApiResponse, InterviewSession } from "@/types";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NOT_FOUND", message: "Session not found." } },
        { status: 404 }
      );
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .order("timestamp_ms", { ascending: true });

    const { data: feedback } = await supabase
      .from("feedback")
      .select("*")
      .eq("session_id", id)
      .single();

    return NextResponse.json<ApiResponse<InterviewSession>>({
      data: {
        ...session,
        messages: messages ?? [],
        feedback: feedback ?? null,
      },
      error: null,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("sessions")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NOT_FOUND", message: "Session not found." } },
        { status: 404 }
      );
    }

    const body = await request.json() as {
      status?: string;
      tavus_conversation_id?: string;
      tavus_conversation_url?: string;
      started_at?: string;
      completed_at?: string;
    };

    const allowedStatuses = ["briefing", "in_progress", "completed", "abandoned"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_STATUS", message: "Invalid session status." } },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (body.status) updates.status = body.status;
    if (body.tavus_conversation_id) updates.tavus_conversation_id = body.tavus_conversation_id;
    if (body.tavus_conversation_url) updates.tavus_conversation_url = body.tavus_conversation_url;
    if (body.started_at) updates.started_at = body.started_at;
    if (body.completed_at) updates.completed_at = body.completed_at;

    const { data, error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[sessions:PATCH]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "UPDATE_FAILED", message: "Could not update session." } },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<InterviewSession>>({
      data: { ...data, messages: [] },
      error: null,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
