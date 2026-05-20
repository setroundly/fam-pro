import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const updateSchema = z.object({
  familyId: z.string().uuid(),
  title: z.string().min(1).max(80).optional(),
  url: z.string().min(1).max(500).optional(),
  note: z.string().max(200).optional(),
});

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function getLinkForFamily(id: string, familyId: string | null) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("family_links")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  }
  if (!data) {
    return { error: NextResponse.json({ error: "リンクが見つかりません" }, { status: 404 }) };
  }
  if (familyId && data.family_id !== familyId) {
    return { error: NextResponse.json({ error: "アクセスできません" }, { status: 403 }) };
  }
  return { link: data };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const found = await getLinkForFamily(id, parsed.data.familyId);
    if ("error" in found && found.error) return found.error;

    const updates: Record<string, string> = {};
    if (parsed.data.title !== undefined) updates.title = parsed.data.title.trim();
    if (parsed.data.url !== undefined) updates.url = normalizeUrl(parsed.data.url);
    if (parsed.data.note !== undefined) updates.note = parsed.data.note.trim();
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("family_links")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: data });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;
  const familyId = request.nextUrl.searchParams.get("familyId");

  try {
    const found = await getLinkForFamily(id, familyId);
    if ("error" in found && found.error) return found.error;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("family_links").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
