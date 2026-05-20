import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveOrCreateUser } from "@/lib/users";

const joinSchema = z.object({
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
  inviteCode: z
    .string()
    .length(6)
    .transform((v) => v.toUpperCase()),
});

export async function POST(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("*")
      .eq("invite_code", parsed.data.inviteCode)
      .maybeSingle();

    if (familyError) {
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }
    if (!family) {
      return NextResponse.json(
        { error: "招待コードが見つかりません" },
        { status: 404 }
      );
    }

    const user = await resolveOrCreateUser(supabase, {
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
    });

    const { data: existingMember } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", family.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingMember) {
      const { error: memberError } = await supabase.from("family_members").insert({
        family_id: family.id,
        user_id: user.id,
        display_name: parsed.data.displayName,
      });

      if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ user, family });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
