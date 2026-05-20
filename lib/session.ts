import {
  FAMILY_BACKUP_STORAGE_KEY,
  FAMILY_NAME_STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "./constants";

export interface FamilyBackup {
  inviteCode: string;
  familyName: string;
  savedAt: string;
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

export function saveSession(params: {
  userId: string;
  displayName: string;
  familyId: string;
  familyName: string;
}) {
  localStorage.setItem(USER_STORAGE_KEY, params.userId);
  localStorage.setItem(USER_NAME_STORAGE_KEY, params.displayName);
  localStorage.setItem(FAMILY_STORAGE_KEY, params.familyId);
  localStorage.setItem(FAMILY_NAME_STORAGE_KEY, params.familyName);
}

export function clearFamilySession() {
  localStorage.removeItem(FAMILY_STORAGE_KEY);
  localStorage.removeItem(FAMILY_NAME_STORAGE_KEY);
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
