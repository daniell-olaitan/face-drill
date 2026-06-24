import { NextRequest, NextResponse } from "next/server";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getVisaProfileOrThrow } from "@/lib/visa-profiles";
import { buildFeedbackPrompt, parseFeedbackResponse, buildMockFeedback } from "@/lib/ai/prompts";
import type { ApiResponse, FeedbackReport } from "@/types";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/sessions/[id]/feedback">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const supabase = await createClient();

    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NOT_FOUND", message: "Session not found." } },
        { status: 404 }
      );
    }

    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("*")
      .eq("session_id", id)
      .single();

    if (existingFeedback) {
      return NextResponse.json<ApiResponse<FeedbackReport>>({ data: existingFeedback, error: null });
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .order("timestamp_ms", { ascending: true });

    const profile = getVisaProfileOrThrow(session.visa_profile_id);
    const messageList = messages ?? [];

    let feedbackData: FeedbackReport;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && messageList.length >= 4) {
      try {
        const prompt = buildFeedbackPrompt(messageList, session.context, profile);

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (res.ok) {
          const json = await res.json() as { content: Array<{ text: string }> };
          const rawText = json.content?.[0]?.text ?? "";
          feedbackData = parseFeedbackResponse(rawText, id);
        } else {
          feedbackData = buildMockFeedback(id);
        }
      } catch {
        feedbackData = buildMockFeedback(id);
      }
    } else {
      feedbackData = buildMockFeedback(id);
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        session_id: id,
        overall_score: feedbackData.overall_score,
        verdict: feedbackData.verdict,
        summary: feedbackData.summary,
        criterion_scores: feedbackData.criterion_scores,
        red_flags: feedbackData.red_flags,
        strengths: feedbackData.strengths,
        improvements: feedbackData.improvements,
        answer_breakdowns: feedbackData.answer_breakdowns,
      })
      .select()
      .single();

    if (error) {
      console.error("[feedback:POST]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INSERT_FAILED", message: "Could not save feedback." } },
        { status: 500 }
      );
    }

    await supabase
      .from("sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json<ApiResponse<FeedbackReport>>(
      { data: { ...feedbackData, id: data.id }, error: null },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
