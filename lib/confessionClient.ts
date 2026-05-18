export const CONFESSION_CLIENT_KEY = "fail_donate_confession_client";

export function getConfessionClientKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem(CONFESSION_CLIENT_KEY);
  if (!key) {
    key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}`;
    localStorage.setItem(CONFESSION_CLIENT_KEY, key);
  }
  return key;
}
