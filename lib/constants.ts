export const USER_STORAGE_KEY = "marutto_user_id";
export const USER_NAME_STORAGE_KEY = "marutto_display_name";
export const FAMILY_STORAGE_KEY = "marutto_family_id";
export const FAMILY_NAME_STORAGE_KEY = "marutto_family_name";
export const FAMILY_BACKUP_STORAGE_KEY = "marutto_family_backup";

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
