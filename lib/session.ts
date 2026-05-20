import {
  FAMILY_NAME_STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "./constants";

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
