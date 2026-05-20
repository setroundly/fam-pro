"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppLogo } from "@/components/AppLogo";
import { formatJstDateTimeLong } from "@/lib/datetime";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { getCategoryEmoji } from "@/lib/recipeMeta";
import { useAdminSession } from "@/lib/useAdminSession";
import type { AdminRecipeRow } from "@/lib/types";

export default function AdminPage() {
  const { isAdmin, loading, login, logout } = useAdminSession();
  const [secret, setSecret] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [recipes, setRecipes] = useState<AdminRecipeRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const { res, data } = await fetchJson<{
        error?: string;
        recipes?: AdminRecipeRow[];
      }>("/api/admin/recipes");
      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "一覧の取得に失敗しました"));
      }
      setRecipes(data.recipes ?? []);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "エラー");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void fetchRecipes();
  }, [isAdmin, fetchRecipes]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      await login(secret);
      setSecret("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "エラー");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleDelete = async (recipe: AdminRecipeRow) => {
    const message = [
      `「${recipe.title}」を削除しますか？`,
      "",
      `家族: ${recipe.family_name}`,
      `投稿者: ${recipe.author_name}`,
      "",
      "この操作は取り消せません。",
    ].join("\n");

    if (!window.confirm(message)) return;

    setDeletingId(recipe.id);
    try {
      const res = await fetch(`/api/admin/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "削除に失敗しました");
      }
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <p className="app-shell p-8 text-center text-kitchen-muted">読み込み中…</p>
    );
  }

  return (
    <div className="app-shell min-h-screen text-kitchen-ink">
      <header className="sticky top-0 z-20 border-b-2 border-kitchen-border/80 bg-kitchen-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <Link href="/">
            <AppLogo size="sm" showTagline={false} />
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-kitchen-muted underline"
            >
              ログアウト
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        {!isAdmin ? (
          <form onSubmit={handleLogin} className="card-nord space-y-4 p-5">
            <h1 className="font-display text-xl text-kitchen">管理画面</h1>
            <p className="text-sm text-kitchen-muted">
              ADMIN_SECRET を入力してください
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-kitchen-muted">
                管理者シークレット
              </span>
              <input
                type="password"
                className="input"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                autoComplete="off"
              />
            </label>
            {loginError && (
              <p className="text-sm text-kitchen">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginSubmitting}
              className="btn-primary w-full"
            >
              {loginSubmitting ? "確認中…" : "入る"}
            </button>
            <p className="text-center">
              <Link href="/" className="text-sm text-kitchen-muted underline">
                トップへ戻る
              </Link>
            </p>
          </form>
        ) : (
          <>
            <h1 className="font-display mb-1 text-xl text-kitchen">管理画面</h1>
            <p className="mb-4 text-sm text-kitchen-muted">
              不適切なレシピの削除はここからのみ可能です
            </p>

            {listLoading && (
              <p className="text-empty-hint py-8">読み込み中…</p>
            )}

            {listError && (
              <div className="card-nord mb-4 px-4 py-3 text-sm text-kitchen">
                {listError}
                <button
                  type="button"
                  onClick={() => void fetchRecipes()}
                  className="mt-2 block font-bold underline"
                >
                  再試行
                </button>
              </div>
            )}

            {!listLoading && !listError && recipes.length === 0 && (
              <p className="text-empty-hint py-12">レシピがありません</p>
            )}

            {!listLoading && !listError && recipes.length > 0 && (
              <ul className="flex flex-col gap-3">
                {recipes.map((recipe) => (
                  <li key={recipe.id} className="card-nord p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getCategoryEmoji(recipe.category ?? "main")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold text-kitchen-ink">
                          {recipe.title}
                        </p>
                        <p className="mt-1 text-xs text-kitchen-muted">
                          {recipe.family_name} · {recipe.author_name}
                        </p>
                        {recipe.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-kitchen-muted">
                            {recipe.description}
                          </p>
                        )}
                        <time className="mt-2 block text-[10px] text-kitchen-muted">
                          {formatJstDateTimeLong(recipe.created_at)} JST
                        </time>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={deletingId === recipe.id}
                      onClick={() => void handleDelete(recipe)}
                      className="mt-3 w-full rounded-nord border-2 border-red-300/60 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                    >
                      {deletingId === recipe.id ? "削除中…" : "このレシピを削除"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-8 text-center">
              <Link href="/" className="text-sm text-kitchen-muted underline">
                トップへ戻る
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
