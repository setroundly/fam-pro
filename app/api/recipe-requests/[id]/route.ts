import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("recipe_requests")
      .update({ status: "done" })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: data });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
