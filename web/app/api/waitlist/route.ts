import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_EMAIL", message: "A valid email is required." } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "INVALID_EMAIL", message: "Please enter a valid email address." } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim() })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json<ApiResponse<{ already: true }>>(
          { data: { already: true }, error: null },
          { status: 200 }
        );
      }
      console.error("[waitlist]", error.message);
    }

    return NextResponse.json<ApiResponse<{ joined: true }>>(
      { data: { joined: true }, error: null },
      { status: 200 }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}
