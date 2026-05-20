import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveOrCreateUser } from "@/lib/users";

const createSchema = z.object({
  familyId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
  title: z.string().min(1).max(80),
  note: z.string().max(300).optional(),
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
      .from("recipe_requests")
      .insert({
        family_id: parsed.data.familyId,
        user_id: user.id,
        requester_name: parsed.data.displayName,
        title: parsed.data.title,
        note: parsed.data.note ?? "",
        status: "open",
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "リクエストの送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: data });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
