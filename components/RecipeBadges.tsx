import {
  getCategoryEmoji,
  getCategoryLabel,
  getEventLabel,
} from "@/lib/recipeMeta";
import type { RecipeCategory, RecipeEvent } from "@/lib/types";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="tag-nord inline-flex items-center gap-1 text-xs">
      <span aria-hidden>{getCategoryEmoji(category)}</span>
      {getCategoryLabel(category)}
    </span>
  );
}

export function EventBadge({ event }: { event: string }) {
  return (
    <span className="inline-flex rounded-full border border-kitchen-muted/50 bg-kitchen-sky/30 px-2 py-0.5 text-[10px] font-semibold text-kitchen-ink">
      {getEventLabel(event)}
    </span>
  );
}

export function RecipeMetaBadges({
  category,
  events,
}: {
  category: RecipeCategory | string;
  events: RecipeEvent[] | string[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <CategoryBadge category={category} />
      {events.map((ev) => (
        <EventBadge key={ev} event={ev} />
      ))}
    </div>
  );
}
