import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const createSchema = z.object({
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
  title: z.string().min(1).max(120),
  deadlineAt: z.string().datetime(),
  penaltyAmount: z.number().int().positive(),
  donationDestination: z.string().min(1).max(120),
  donateUrl: z.string().url().optional().or(z.literal("")),
  notifyName: z.string().min(1).max(64),
  notifyEmail: z.string().email(),
});

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
  const userId = request.nextUrl.searchParams.get("userId");
  const supabase = getSupabaseAdmin();

  if (userId) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data ?? [] });
  }

  const { data: timeline, error: timelineError } = await supabase
    .from("timeline_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (timelineError) {
    return NextResponse.json({ error: timelineError.message }, { status: 500 });
  }

  const posts = timeline ?? [];
  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const taskIds = posts.map((p) => p.task_id);
  const failCounts: Record<string, number> = {};
  const donateUrls: Record<string, string | null> = {};

  for (const uid of userIds) {
    const { data: count } = await supabase.rpc("get_consecutive_fail_count", {
      p_user_id: uid,
    });
    failCounts[uid] = (count as number) ?? 0;
  }

  if (taskIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, donate_url")
      .in("id", taskIds);

    for (const t of tasks ?? []) {
      donateUrls[t.id] = t.donate_url;
    }
  }

  const enriched = posts.map((p) => ({
    ...p,
    consecutive_fail_count: failCounts[p.user_id] ?? 0,
    donate_url: donateUrls[p.task_id] ?? null,
  }));

  return NextResponse.json({ timeline: enriched });
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

  const data = parsed.data;
  const supabase = getSupabaseAdmin();

  let userId = data.userId;

  if (userId) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existing) userId = undefined;
  }

  if (!userId) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ display_name: data.displayName })
      .select("id, display_name")
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message ?? "Failed to create user" },
        { status: 500 }
      );
    }
    userId = user.id;
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: data.title,
      deadline_at: data.deadlineAt,
      penalty_amount: data.penaltyAmount,
      donation_destination: data.donationDestination,
      donate_url: data.donateUrl || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: taskError?.message ?? "Failed to create task" },
      { status: 500 }
    );
  }

  const { error: notifyError } = await supabase
    .from("notification_targets")
    .insert({
      task_id: task.id,
      type: "email",
      label: data.notifyName,
      destination: data.notifyEmail,
    });

  if (notifyError) {
    return NextResponse.json({ error: notifyError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: userId, display_name: data.displayName },
    task,
  });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
