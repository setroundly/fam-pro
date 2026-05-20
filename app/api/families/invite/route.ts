import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { parseInviteCode } from "@/lib/familyInvite";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const code = parseInviteCode(request.nextUrl.searchParams.get("code"));
  if (!code) {
    return NextResponse.json({ error: "招待リンクが無効です" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: family, error } = await supabase
      .from("families")
      .select("id, name, invite_code")
      .eq("invite_code", code)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!family) {
      return NextResponse.json({ error: "レシピ帳が見つかりません" }, { status: 404 });
    }

    const { count } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true })
      .eq("family_id", family.id);

    return NextResponse.json({
      family: {
        name: family.name,
        memberCount: count ?? 0,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
