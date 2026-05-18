import { NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { processOverdueFailures } from "@/lib/failTasks";

export const dynamic = "force-dynamic";

/** 締切超過タスクを即時失敗化（Vercel Cron の代替・クライアントから呼ぶ） */
export async function POST() {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    const result = await processOverdueFailures();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
