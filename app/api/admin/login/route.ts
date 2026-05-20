import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  verifyAdminSecret,
} from "@/lib/adminSession";

const schema = z.object({
  secret: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "ADMIN_SECRET が設定されていません" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  if (!verifyAdminSecret(parsed.data.secret)) {
    return NextResponse.json({ error: "シークレットが違います" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
