export type ApiErrorBody = { error?: string; details?: unknown };

export async function fetchJson<T = ApiErrorBody>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ res: Response; data: T }> {
  const res = await fetch(input, init);
  const data = await parseJsonResponse<T>(res);
  return { res, data };
}

export async function parseJsonResponse<T = ApiErrorBody>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(
        res.status === 500
          ? "サーバーエラーが発生しました。.env.local の Supabase 設定を確認してください。"
          : `API error (${res.status})`
      );
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? "サーバーから不正な応答が返されました"
        : `API error (${res.status})`
    );
  }
}

export function apiErrorMessage(
  data: ApiErrorBody | Record<string, unknown>,
  fallback: string
): string {
  const err = (data as ApiErrorBody).error;
  return typeof err === "string" ? err : fallback;
}
