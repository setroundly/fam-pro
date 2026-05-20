import { NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { requireAdminSession } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { AdminRecipeRow, Recipe } from "@/lib/types";

export async function GET() {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const auth = await requireAdminSession();
  if ("error" in auth) return auth.error;

  try {
    const supabase = getSupabaseAdmin();
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const familyIds = [...new Set((recipes ?? []).map((r) => r.family_id as string))];
    const familyNames = new Map<string, string>();

    if (familyIds.length > 0) {
      const { data: families } = await supabase
        .from("families")
        .select("id, name")
        .in("id", familyIds);

      for (const family of families ?? []) {
        familyNames.set(family.id, family.name);
      }
    }

    const rows: AdminRecipeRow[] = (recipes ?? []).map((recipe) => ({
      ...(recipe as Recipe),
      family_name: familyNames.get(recipe.family_id as string) ?? "不明",
    }));

    return NextResponse.json({ recipes: rows });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
