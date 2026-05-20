import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { todayIsoDate } from "@/lib/dates";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveOrCreateUser } from "@/lib/users";

const createSchema = z.object({
  familyId: z.string().uuid(),
  recipeId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
  cookedOn: z.string().date().optional(),
  note: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const user = await resolveOrCreateUser(supabase, {
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
    });

    const { data, error } = await supabase
      .from("cooking_logs")
      .insert({
        family_id: parsed.data.familyId,
        recipe_id: parsed.data.recipeId,
        user_id: user.id,
        cooked_by_name: parsed.data.displayName,
        cooked_on: parsed.data.cookedOn ?? todayIsoDate(),
        note: parsed.data.note ?? "",
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "記録に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ log: data });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
