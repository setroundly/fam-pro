import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  const userId = request.nextUrl.searchParams.get("userId");
  if (!familyId || !userId) {
    return NextResponse.json(
      { error: "familyId and userId are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", familyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member: Boolean(data) });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
