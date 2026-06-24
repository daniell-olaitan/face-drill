import { NextRequest, NextResponse } from "next/server";
import { createClient, requireUser } from "@/lib/supabase/server";
import type { ApiResponse, UserProfile } from "@/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NOT_FOUND", message: "Profile not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<UserProfile>>({ data, error: null });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const body = await request.json() as Partial<UserProfile>;

    const allowedFields: (keyof UserProfile)[] = ["full_name", "nationality"];
    const updates: Partial<UserProfile> = {};
    for (const field of allowedFields) {
      if (field in body) {
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "NO_CHANGES", message: "No valid fields to update." } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[profile:PATCH]", error.message);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: { code: "UPDATE_FAILED", message: "Could not update profile." } },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<UserProfile>>({ data, error: null });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
}
