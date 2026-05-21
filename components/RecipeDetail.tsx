"use client";

import { useEffect, useState } from "react";
import { RecipeMetaBadges } from "@/components/RecipeBadges";
import { IngredientList } from "@/components/IngredientList";
import { COPY } from "@/lib/copy";
import { formatJaDate } from "@/lib/dates";
import { getCategoryEmoji } from "@/lib/recipeMeta";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { formatRecipeTime } from "@/lib/recipeText";
import { getStoredDisplayName, getStoredFamilyId, getStoredUserId } from "@/lib/session";
import type { Recipe } from "@/lib/types";

interface RecipeDetailProps {
  recipeId: string;
  onBack: () => void;
  onEdit: () => void;
  onCooked?: () => void;
}

export function RecipeDetail({ recipeId, onBack, onEdit, onCooked }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooking, setCooking] = useState(false);
  const [cookedMsg, setCookedMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const familyId = getStoredFamilyId();
      const query = familyId ? `?familyId=${familyId}` : "";
      try {
        const { res, data } = await fetchJson<{ recipe?: Recipe; error?: string }>(
          `/api/recipes/${recipeId}${query}`
        );
        if (!res.ok || !data.recipe) {
          throw new Error(apiErrorMessage(data, "レシピが見つかりません"));
        }
        setRecipe(data.recipe);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [recipeId]);

  if (loading) {
    return <p className="text-empty-hint py-8">読み込み中…</p>;
  }

  if (error || !recipe) {
    return (
      <div className="space-y-4">
        <p className="card-nord px-4 py-3 text-sm text-kitchen">{error ?? "レシピが見つかりません"}</p>
        <button type="button" onClick={onBack} className="btn-secondary w-full">
          一覧に戻る
        </button>
      </div>
    );
  }

  const time = formatRecipeTime(recipe.prep_minutes, recipe.cook_minutes);

  async function markCookedToday() {
    const familyId = getStoredFamilyId();
    if (!familyId || !recipe) return;
    setCooking(true);
    setCookedMsg(null);
    try {
      const { res, data } = await fetchJson<{ error?: string }>("/api/cooking-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          recipeId: recipe.id,
          userId: getStoredUserId(),
          displayName: getStoredDisplayName(),
        }),
      });
      if (!res.ok) throw new Error(apiErrorMessage(data, "記録に失敗しました"));
      setCookedMsg(COPY.recipe.cookDone);
      onCooked?.();
    } catch (err) {
      setCookedMsg(err instanceof Error ? err.message : "エラー");
    } finally {
      setCooking(false);
    }
  }

  return (
    <article className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-kitchen hover:underline"
        >
          ← ホームに戻る
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          編集
        </button>
      </div>

      <button
        type="button"
        disabled={cooking}
        onClick={() => void markCookedToday()}
        className="btn-primary w-full"
      >
        {cooking ? "記録中…" : COPY.recipe.cookButton}
      </button>
      {cookedMsg && (
        <p className="text-center text-sm text-kitchen">{cookedMsg}</p>
      )}

      <header className="card-nord overflow-hidden p-0">
        {recipe.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="max-h-56 w-full object-cover"
          />
        )}
        <div className="p-5">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-kitchen-sky/50 text-2xl">
            {getCategoryEmoji(recipe.category ?? "main")}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-kitchen-ink">{recipe.title}</h2>
            <p className="mt-2 text-sm text-kitchen-muted">
              {recipe.author_name} が残した味
              {time && ` · ${time}`}
              {recipe.servings != null && ` · ${recipe.servings}人分`}
            </p>
            <p className="mt-1 text-xs text-kitchen-muted">
              {(recipe.cook_count ?? 0) > 0
                ? COPY.recipe.cookCount(recipe.cook_count ?? 0)
                : COPY.recipe.neverCooked}
              {recipe.last_cooked_on &&
                ` · ${COPY.recipe.lastCooked(formatJaDate(recipe.last_cooked_on))}`}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <RecipeMetaBadges
            category={recipe.category ?? "main"}
            events={recipe.events ?? []}
          />
        </div>
        {recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span key={tag} className="tag-nord text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
        {recipe.description && (
          <blockquote className="memory-note mt-4">{recipe.description}</blockquote>
        )}
        </div>
      </header>

      <section className="card-nord p-5">
        <h3 className="font-display font-semibold text-kitchen">材料</h3>
        <div className="mt-3">
          <IngredientList items={recipe.ingredients} />
        </div>
      </section>

      <section className="card-nord p-5">
        <h3 className="font-display font-semibold text-kitchen">作り方</h3>
        <ol className="mt-4 space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={`${index}-${step}`} className="flex gap-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kitchen bg-kitchen-cream text-xs font-bold text-kitchen">
                {index + 1}
              </span>
              <span className="pt-1 leading-relaxed text-kitchen-ink">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
