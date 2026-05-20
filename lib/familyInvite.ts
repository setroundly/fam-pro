import { getAppBaseUrl } from "./constants";

const INVITE_PATTERN = /^[A-Z2-9]{6}$/;

/** URL や入力から招待コードを正規化（無効なら null） */
export function parseInviteCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return INVITE_PATTERN.test(code) ? code : null;
}

export function buildFamilyInviteUrl(inviteCode: string): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}/?join=${inviteCode}`;
}
