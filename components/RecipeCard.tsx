"use client";

import { RecipeMetaBadges } from "@/components/RecipeBadges";
import { getCategoryEmoji } from "@/lib/recipeMeta";
import { formatRecipeTime } from "@/lib/recipeText";
import type { Recipe } from "@/lib/types";

export function RecipeCard({
  recipe,
  onClick,
  badge,
}: {
  recipe: Recipe;
  onClick: () => void;
  badge?: string;
}) {
  const time = formatRecipeTime(recipe.prep_minutes, recipe.cook_minutes);

  return (
    <button
      type="button"
      onClick={onClick}
      className="card-nord group flex w-full gap-3 p-3 text-left transition hover:border-kitchen hover:shadow-nord"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-kitchen-sky/40 text-lg">
        {recipe.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.photo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          getCategoryEmoji(recipe.category)
        )}
        {badge ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-kitchen px-1.5 py-0.5 text-[9px] font-bold text-kitchen-cream">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="font-display block text-sm font-semibold text-kitchen-ink group-hover:text-kitchen">
          {recipe.title}
        </span>
        <span className="mt-0.5 block text-[11px] text-kitchen-muted">
          {recipe.author_name}
          {time ? ` · ${time}` : ""}
        </span>
        <span className="mt-1.5 block">
          <RecipeMetaBadges
            category={recipe.category}
            events={recipe.events ?? []}
          />
        </span>
      </span>
    </button>
  );
}
