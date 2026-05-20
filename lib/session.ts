import {
  FAMILY_BACKUP_STORAGE_KEY,
  FAMILY_NAME_STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "./constants";

const SESSION_COOKIE_NAME = "marutto_fam_session_v1";
const SESSION_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export interface FamilyBackup {
  inviteCode: string;
  familyName: string;
  savedAt: string;
}

export interface StoredSession {
  userId: string;
  displayName: string;
  familyId: string;
  familyName: string;
  inviteCode: string;
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_STORAGE_KEY);
}

export function getStoredDisplayName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "";
}

export function getStoredFamilyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FAMILY_STORAGE_KEY);
}

export function getStoredFamilyName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(FAMILY_NAME_STORAGE_KEY) ?? "";
}

function writeSessionCookie(session: StoredSession) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function readSessionCookie(): StoredSession | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`)
  );
  if (!match) return null;
  try {
    const data = JSON.parse(decodeURIComponent(match[1])) as StoredSession;
    if (
      !data.userId ||
      !data.familyId ||
      !data.inviteCode ||
      !data.familyName
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/** localStorage が消えても cookie から復元する */
export function restoreSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const userId = getStoredUserId();
  const familyId = getStoredFamilyId();
  const backup = getFamilyBackup();

  if (userId && familyId && backup?.inviteCode) {
    return {
      userId,
      displayName: getStoredDisplayName(),
      familyId,
      familyName: getStoredFamilyName() || backup.familyName,
      inviteCode: backup.inviteCode,
    };
  }

  const fromCookie = readSessionCookie();
  if (!fromCookie) return null;

  localStorage.setItem(USER_STORAGE_KEY, fromCookie.userId);
  localStorage.setItem(USER_NAME_STORAGE_KEY, fromCookie.displayName);
  localStorage.setItem(FAMILY_STORAGE_KEY, fromCookie.familyId);
  localStorage.setItem(FAMILY_NAME_STORAGE_KEY, fromCookie.familyName);
  saveFamilyBackup({
    inviteCode: fromCookie.inviteCode,
    familyName: fromCookie.familyName,
  });
  return fromCookie;
}

export function saveSession(params: {
  userId: string;
  displayName: string;
  familyId: string;
  familyName: string;
  inviteCode?: string;
}) {
  localStorage.setItem(USER_STORAGE_KEY, params.userId);
  localStorage.setItem(USER_NAME_STORAGE_KEY, params.displayName);
  localStorage.setItem(FAMILY_STORAGE_KEY, params.familyId);
  localStorage.setItem(FAMILY_NAME_STORAGE_KEY, params.familyName);

  const inviteCode =
    params.inviteCode ?? getFamilyBackup()?.inviteCode ?? "";
  if (inviteCode) {
    saveFamilyBackup({
      inviteCode,
      familyName: params.familyName,
    });
    writeSessionCookie({
      userId: params.userId,
      displayName: params.displayName,
      familyId: params.familyId,
      familyName: params.familyName,
      inviteCode,
    });
  }
}

export function persistSession(session: StoredSession) {
  saveSession(session);
}

export function clearFamilySession() {
  localStorage.removeItem(FAMILY_STORAGE_KEY);
  localStorage.removeItem(FAMILY_NAME_STORAGE_KEY);
  localStorage.removeItem(FAMILY_BACKUP_STORAGE_KEY);
  clearSessionCookie();
}

/** 端末を替えても戻れるよう、参加リンク情報を端末に残す（レシピ本体は Supabase に保存） */
export function saveFamilyBackup(params: { inviteCode: string; familyName: string }) {
  const backup: FamilyBackup = {
    inviteCode: params.inviteCode,
    familyName: params.familyName,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(FAMILY_BACKUP_STORAGE_KEY, JSON.stringify(backup));
}

export function getFamilyBackup(): FamilyBackup | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(FAMILY_BACKUP_STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as FamilyBackup;
    if (!data.inviteCode || !data.familyName) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearFamilyBackup() {
  localStorage.removeItem(FAMILY_BACKUP_STORAGE_KEY);
}
