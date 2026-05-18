import type { NextRequest } from "next/server";
import type { SessionPayload } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/session";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "development") {
    return "dev-only-session-secret-32chars!!";
  }
  return "";
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function signPayload(encoded: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encoded)
  );
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getRequestSessionEdge(
  request: NextRequest
): Promise<SessionPayload | null> {
  const secret = getSecret();
  if (!secret) return null;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const expected = await signPayload(encoded, secret);
    if (!timingSafeEqualString(sig, expected)) return null;

    const data = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!data.userId || !data.displayName || !data.role || !data.exp) return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    return data;
  } catch {
    return null;
  }
}
