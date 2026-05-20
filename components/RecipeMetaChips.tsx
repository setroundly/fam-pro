"use client";

import {
  RECIPE_CATEGORIES,
  RECIPE_EVENTS,
  type RecipeCategory,
  type RecipeEvent,
} from "@/lib/recipeMeta";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: RecipeCategory;
  onChange: (v: RecipeCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="料理の種類">
      {RECIPE_CATEGORIES.map((cat) => {
        const active = value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(cat.id)}
            className={`rounded-full border-2 px-3 py-2 text-sm font-semibold transition ${
              active
                ? "border-kitchen bg-kitchen text-kitchen-cream shadow-nord-sm"
                : "border-kitchen-border bg-kitchen-card text-kitchen-ink hover:border-kitchen"
            }`}
          >
            <span aria-hidden>{cat.emoji}</span> {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export function EventPicker({
  value,
  onChange,
}: {
  value: RecipeEvent[];
  onChange: (v: RecipeEvent[]) => void;
}) {
  function toggle(id: RecipeEvent) {
    if (value.includes(id)) {
      onChange(value.filter((e) => e !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="イベント">
      {RECIPE_EVENTS.map((ev) => {
        const active = value.includes(ev.id);
        return (
          <button
            key={ev.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(ev.id)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-kitchen-muted bg-kitchen-sky/50 text-kitchen-ink"
                : "border-kitchen-border/80 bg-kitchen-cream/60 text-kitchen-muted hover:border-kitchen"
            }`}
          >
            {ev.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-kitchen bg-kitchen text-kitchen-cream"
          : "border-kitchen-border bg-kitchen-card text-kitchen-muted hover:border-kitchen"
      }`}
    >
      {children}
    </button>
  );
}
