import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { mapRowToFailure } from "@/lib/failures";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const postSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  donationAmount: z.number().int().positive(),
  userName: z.string().min(1).max(32).optional(),
});

export async function GET() {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    const supabase = getSupabaseAdmin();

    const { data: rows, error } = await supabase
      .from("failures")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const failures = (rows ?? []).map((row) => mapRowToFailure(row));
    const userIds = [
      ...new Set(failures.map((f) => f.user_id).filter(Boolean)),
    ] as string[];
    const taskIds = [
      ...new Set(failures.map((f) => f.task_id).filter(Boolean)),
    ] as string[];

    const failCounts: Record<string, number> = {};
    for (const uid of userIds) {
      const { data: count } = await supabase.rpc("get_consecutive_fail_count", {
        p_user_id: uid,
      });
      failCounts[uid] = (count as number) ?? 0;
    }

    const donateUrls: Record<string, string | null> = {};
    if (taskIds.length > 0) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, donate_url")
        .in("id", taskIds);
      for (const t of tasks ?? []) {
        donateUrls[t.id] = t.donate_url;
      }
    }

    const enriched = failures.map((f) => ({
      ...f,
      donate_url:
        f.donate_url ?? (f.task_id ? donateUrls[f.task_id] ?? null : null),
      consecutive_fail_count: f.user_id
        ? failCounts[f.user_id] ?? 0
        : 0,
    }));

    return NextResponse.json({ failures: enriched });
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
  const userName = (data.userName?.trim() || "匿名").slice(0, 32);

  try {
    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("failures")
      .insert({
        title: data.title.trim(),
        description: data.description.trim(),
        donation_amount: data.donationAmount,
        user_name: userName,
      })
      .select("*")
      .single();

    if (error || !row) {
      return NextResponse.json(
        { error: error?.message ?? "投稿に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ failure: mapRowToFailure(row) });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
