import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id: memberId } = await params;
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

    const { data: requester, error: requesterError } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", familyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (requesterError) {
      return NextResponse.json({ error: requesterError.message }, { status: 500 });
    }
    if (!requester) {
      return NextResponse.json({ error: "家族のメンバーではありません" }, { status: 403 });
    }

    const { data: target, error: targetError } = await supabase
      .from("family_members")
      .select("id, user_id")
      .eq("id", memberId)
      .eq("family_id", familyId)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 500 });
    }
    if (!target) {
      return NextResponse.json({ error: "メンバーが見つかりません" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId)
      .eq("family_id", familyId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      deleted: true,
      wasSelf: target.user_id === userId,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
