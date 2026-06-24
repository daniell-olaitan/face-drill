import { NextRequest, NextResponse } from "next/server";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getVisaProfile } from "@/lib/visa-profiles";
import type { ApiResponse, InterviewSession, SessionContext } from "@/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[sessions:GET]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "FETCH_ERROR", message: "Could not load sessions." } },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<InterviewSession[]>>({ data: data ?? [], error: null });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const body = await request.json() as { context: SessionContext };
    const { context } = body;

    if (!context?.visaProfileId) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_BODY", message: "visaProfileId is required in context." } },
        { status: 400 }
      );
    }

    const profile = getVisaProfile(context.visaProfileId);
    if (!profile) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_VISA", message: "Unknown visa profile ID." } },
        { status: 400 }
      );
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("sessions_used, sessions_limit, tier")
      .eq("id", user.id)
      .single();

    if (profileRow && profileRow.tier === "free" && profileRow.sessions_used >= profileRow.sessions_limit) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "LIMIT_REACHED", message: "You have reached your free session limit." } },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        visa_profile_id: context.visaProfileId,
        status: "created",
        context,
      })
      .select()
      .single();

    if (error) {
      console.error("[sessions:POST]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "CREATE_FAILED", message: "Could not create session." } },
        { status: 500 }
      );
    }

    await supabase
      .from("profiles")
      .update({ sessions_used: (profileRow?.sessions_used ?? 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json<ApiResponse<InterviewSession>>(
      { data: { ...data, messages: [] }, error: null },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
