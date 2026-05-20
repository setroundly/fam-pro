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
  url: z.string().min(1).max(500),
  note: z.string().max(200).optional(),
});

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  if (!familyId) {
    return NextResponse.json({ error: "familyId is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("family_links")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ links: data ?? [] });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

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
      .from("family_links")
      .insert({
        family_id: parsed.data.familyId,
        user_id: user.id,
        author_name: parsed.data.displayName,
        title: parsed.data.title.trim(),
        url: normalizeUrl(parsed.data.url),
        note: parsed.data.note?.trim() ?? "",
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "リンクの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: data });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
