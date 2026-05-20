import { getAppBaseUrl } from "./constants";
import { getFamilyBackup, getStoredFamilyId } from "./session";

const INVITE_PATTERN = /^[A-Z2-9]{6}$/;

/** URL や入力から招待コードを正規化（無効なら null） */
export function parseInviteCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return INVITE_PATTERN.test(code) ? code : null;
}

export function isActiveFamilyInvite(inviteCode: string): boolean {
  const code = parseInviteCode(inviteCode);
  if (!code) return false;
  const familyId = getStoredFamilyId();
  const backup = getFamilyBackup();
  return Boolean(familyId && backup?.inviteCode === code);
}

export function getActiveInviteCode(): string | null {
  if (!getStoredFamilyId()) return null;
  return getFamilyBackup()?.inviteCode ?? null;
}

export function familyJoinPath(inviteCode: string): string {
  const code = parseInviteCode(inviteCode);
  return code ? `/join/${code}` : "/";
}

export function buildFamilyInviteUrl(inviteCode: string): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}${familyJoinPath(inviteCode)}`;
}
