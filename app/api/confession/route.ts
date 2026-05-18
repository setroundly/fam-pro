import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const postSchema = z.object({
  displayName: z.string().min(1).max(32),
  body: z.string().min(1).max(800),
  parentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export async function GET() {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    const supabase = getSupabaseAdmin();

    const { data: rows, error } = await supabase
      .from("confession_posts")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const all = rows ?? [];
    const roots = all.filter((p) => !p.parent_id);
    const byParent = new Map<string, typeof all>();

    for (const p of all) {
      if (!p.parent_id) continue;
      const list = byParent.get(p.parent_id) ?? [];
      list.push(p);
      byParent.set(p.parent_id, list);
    }

    const threads = roots
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((root) => ({
        ...root,
        replies: (byParent.get(root.id) ?? []).sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));

    return NextResponse.json({ threads });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const supabase = getSupabaseAdmin();

    if (data.parentId) {
      const { data: parent } = await supabase
        .from("confession_posts")
        .select("id, parent_id")
        .eq("id", data.parentId)
        .single();

      if (!parent) {
        return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
      }
      if (parent.parent_id) {
        return NextResponse.json(
          { error: "返信への返信はできません" },
          { status: 400 }
        );
      }
    }

    const { data: post, error } = await supabase
      .from("confession_posts")
      .insert({
        user_id: data.userId ?? null,
        display_name: data.displayName.trim(),
        body: data.body.trim(),
        parent_id: data.parentId ?? null,
      })
      .select("*")
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: error?.message ?? "投稿に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ post });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
