export function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(items: string[]): string {
  return items.join("\n");
}

export function formatMinutes(total: number | null): string | null {
  if (total == null || total <= 0) return null;
  if (total < 60) return `${total}分`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function formatRecipeTime(
  prep: number | null,
  cook: number | null
): string | null {
  const parts = [formatMinutes(prep), formatMinutes(cook)].filter(
    Boolean
  ) as string[];
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return parts.join(" + ");
}
