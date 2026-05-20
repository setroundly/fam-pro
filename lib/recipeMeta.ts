export const RECIPE_CATEGORIES = [
  { id: "staple", label: "主食", emoji: "🍚" },
  { id: "main", label: "主菜", emoji: "🍖" },
  { id: "side", label: "副菜", emoji: "🥗" },
  { id: "sweets", label: "お菓子", emoji: "🍰" },
  { id: "drink", label: "ドリンク", emoji: "☕" },
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]["id"];

export const RECIPE_EVENTS = [
  { id: "birthday", label: "誕生日" },
  { id: "anniversary", label: "記念日" },
  { id: "holiday", label: "祝日" },
  { id: "new_year", label: "お正月" },
  { id: "christmas", label: "クリスマス" },
  { id: "obon", label: "お盆" },
  { id: "party", label: "パーティー" },
  { id: "everyday", label: "日常" },
] as const;

export type RecipeEvent = (typeof RECIPE_EVENTS)[number]["id"];

const categoryMap = Object.fromEntries(
  RECIPE_CATEGORIES.map((c) => [c.id, c])
) as Record<RecipeCategory, (typeof RECIPE_CATEGORIES)[number]>;

const eventMap = Object.fromEntries(
  RECIPE_EVENTS.map((e) => [e.id, e])
) as Record<RecipeEvent, (typeof RECIPE_EVENTS)[number]>;

export function getCategoryLabel(id: string): string {
  return categoryMap[id as RecipeCategory]?.label ?? id;
}

export function getCategoryEmoji(id: string): string {
  return categoryMap[id as RecipeCategory]?.emoji ?? "🍽";
}

export function getEventLabel(id: string): string {
  return eventMap[id as RecipeEvent]?.label ?? id;
}

export function isRecipeCategory(id: string): id is RecipeCategory {
  return id in categoryMap;
}

export function isRecipeEvent(id: string): id is RecipeEvent {
  return id in eventMap;
}

export const CATEGORY_ORDER: RecipeCategory[] = [
  "staple",
  "main",
  "side",
  "sweets",
  "drink",
];
