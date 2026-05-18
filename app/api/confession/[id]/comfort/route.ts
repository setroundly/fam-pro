import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const comfortSchema = z.object({
  clientKey: z.string().min(8).max(64),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = comfortSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error: insertError } = await supabase
      .from("confession_comforts")
      .insert({
        post_id: id,
        client_key: parsed.data.clientKey,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: post } = await supabase
          .from("confession_posts")
          .select("comfort_count")
          .eq("id", id)
          .single();
        return NextResponse.json({
          comfortCount: post?.comfort_count ?? 0,
          already: true,
        });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: count, error: rpcError } = await supabase.rpc(
      "increment_confession_comfort",
      { p_post_id: id }
    );

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({ comfortCount: count as number, already: false });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
