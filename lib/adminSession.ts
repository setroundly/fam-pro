import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "marutto_admin";
const MAX_AGE_SEC = 60 * 60 * 8;

export interface AdminSessionPayload {
  role: "admin";
  exp: number;
}

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "development") {
    return "dev-admin-secret-16chars!!";
  }
  throw new Error("ADMIN_SECRET is not configured");
}

function sign(encoded: string): string {
  return createHmac("sha256", getAdminSecret()).update(encoded).digest("base64url");
}

export function createAdminSessionToken(maxAgeSec = MAX_AGE_SEC): string {
  const payload: AdminSessionPayload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseAdminSessionToken(
  token: string | undefined
): AdminSessionPayload | null {
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const expected = sign(encoded);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const data = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (data.role !== "admin" || !data.exp) return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    return data;
  } catch {
    return null;
  }
}

export function verifyAdminSecret(input: string): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "development") {
      return input === "dev-admin-secret-16chars!!";
    }
    return false;
  }
  if (input.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export async function getServerAdminSession(): Promise<AdminSessionPayload | null> {
  const jar = await cookies();
  return parseAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export function getRequestAdminSession(
  request: NextRequest
): AdminSessionPayload | null {
  return parseAdminSessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions(maxAgeSec = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
