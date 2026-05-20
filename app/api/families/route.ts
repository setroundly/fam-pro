import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { generateInviteCode } from "@/lib/inviteCode";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveOrCreateUser } from "@/lib/users";

const createSchema = z.object({
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
  familyName: z.string().min(1).max(40),
});

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  if (!familyId) {
    return NextResponse.json({ error: "familyId is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: family, error } = await supabase
      .from("families")
      .select("*")
      .eq("id", familyId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!family) {
      return NextResponse.json({ error: "家族が見つかりません" }, { status: 404 });
    }

    const { count } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true })
      .eq("family_id", familyId);

    return NextResponse.json({
      family: { ...family, member_count: count ?? 0 },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

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

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const user = await resolveOrCreateUser(supabase, {
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
    });

    let family = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase
        .from("families")
        .insert({
          name: parsed.data.familyName,
          invite_code: inviteCode,
        })
        .select("*")
        .single();

      if (!error && data) {
        family = data;
        break;
      }
      if (error?.code !== "23505") {
        return NextResponse.json(
          { error: error?.message ?? "家族の作成に失敗しました" },
          { status: 500 }
        );
      }
    }

    if (!family) {
      return NextResponse.json(
        { error: "招待コードの生成に失敗しました" },
        { status: 500 }
      );
    }

    const { error: memberError } = await supabase.from("family_members").insert({
      family_id: family.id,
      user_id: user.id,
      display_name: parsed.data.displayName,
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({
      user,
      family,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
