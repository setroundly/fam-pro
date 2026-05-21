export function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(items: string[]): string {
  return items.join("\n");
}

export interface ParsedIngredient {
  name: string;
  amount: string;
  raw: string;
}

/** 材料行を「名前」と「量」に分ける（全角スペース・タブ・2つ以上の半角スペース） */
export function parseIngredientLine(line: string): ParsedIngredient {
  const raw = line.trim();
  if (!raw) return { name: "", amount: "", raw: "" };

  const wideSplit = raw.match(/^(.+?)(?:[\t　]+|\s{2,})(.+)$/);
  if (wideSplit) {
    return { name: wideSplit[1].trim(), amount: wideSplit[2].trim(), raw };
  }

  const singleSplit = raw.match(/^(.+?)\s+(\S.+)$/);
  if (singleSplit) {
    return { name: singleSplit[1].trim(), amount: singleSplit[2].trim(), raw };
  }

  return { name: raw, amount: "", raw };
}

export function parseIngredients(items: string[]): ParsedIngredient[] {
  return items.map(parseIngredientLine);
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
