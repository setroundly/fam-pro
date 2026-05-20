import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  if (!familyId) {
    return NextResponse.json({ error: "familyId is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id, name, invite_code, created_at")
      .eq("id", familyId)
      .maybeSingle();

    if (familyError) {
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }
    if (!family) {
      return NextResponse.json({ error: "家族が見つかりません" }, { status: 404 });
    }

    const [recipesRes, linksRes] = await Promise.all([
      supabase
        .from("recipes")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("family_links")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false }),
    ]);

    if (recipesRes.error) {
      return NextResponse.json({ error: recipesRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      family,
      recipes: recipesRes.data ?? [],
      links: linksRes.error ? [] : linksRes.data ?? [],
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
