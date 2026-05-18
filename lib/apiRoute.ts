import { NextResponse } from "next/server";
import { getSupabaseConfigError } from "./supabaseAdmin";

export function supabaseConfigResponse() {
  const message = getSupabaseConfigError();
  if (!message) return null;
  return NextResponse.json({ error: message }, { status: 503 });
}

export function apiErrorResponse(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}
