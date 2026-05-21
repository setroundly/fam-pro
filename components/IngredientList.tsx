import { parseIngredients } from "@/lib/recipeText";

interface IngredientListProps {
  items: string[];
  className?: string;
}

export function IngredientList({ items, className = "" }: IngredientListProps) {
  const rows = parseIngredients(items);
  const hasAmounts = rows.some((row) => row.amount);

  if (rows.length === 0) return null;

  if (!hasAmounts) {
    return (
      <ul className={`space-y-2 ${className}`.trim()}>
        {rows.map((row) => (
          <li key={row.raw} className="flex gap-2.5 text-sm text-kitchen-ink">
            <span className="font-bold text-kitchen">·</span>
            <span>{row.name}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`ingredient-list space-y-1.5 ${className}`.trim()}>
      {rows.map((row, index) => (
        <li
          key={`${index}-${row.raw}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 text-sm leading-relaxed"
        >
          <span className="text-kitchen-ink">{row.name}</span>
          {row.amount ? (
            <span className="whitespace-nowrap text-right tabular-nums text-kitchen-muted">
              {row.amount}
            </span>
          ) : (
            <span />
          )}
        </li>
      ))}
    </ul>
  );
}
