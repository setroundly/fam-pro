export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "まるっとfam proレシピ";

export const APP_TAGLINE = "実用と、思い出の、うちのレシピ帳";

export const APP_DESCRIPTION =
  "献立の便利さと、家族の思い出が積み重なる。まるっとfam proレシピは、検索だけでは終わらない家庭の台所アプリです。";

/** 本番 URL（Vercel では Environment Variables に設定） */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
