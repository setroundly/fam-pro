export const USER_STORAGE_KEY = "fail_donate_user_id";
export const USER_NAME_STORAGE_KEY = "fail_donate_display_name";

export const SETROUNDLY_URL =
  process.env.NEXT_PUBLIC_SETROUNDLY_URL ?? "https://setroundly.com";

export const DEFAULT_DONATE_URL =
  process.env.NEXT_PUBLIC_DEFAULT_DONATE_URL ?? "https://setroundly.com/donate";

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
