import { isStaleLastCooked } from "./dates";
import type { CookingLog, Recipe } from "./types";

export function buildLastCookedMap(
  logs: { recipe_id: string; cooked_on: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const log of logs) {
    const prev = map.get(log.recipe_id);
    if (!prev || log.cooked_on > prev) {
      map.set(log.recipe_id, log.cooked_on);
    }
  }
  return map;
}

export function enrichRecipes(
  recipes: Recipe[],
  lastCooked: Map<string, string>
): Recipe[] {
  return recipes.map((r) => ({
    ...r,
    last_cooked_on: lastCooked.get(r.id) ?? null,
  }));
}

export function pickStaleRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter((r) => isStaleLastCooked(r.last_cooked_on));
}

export function attachRecipeTitles(
  logs: CookingLog[],
  recipes: Recipe[]
): CookingLog[] {
  const titles = new Map(recipes.map((r) => [r.id, r.title]));
  return logs.map((log) => ({
    ...log,
    recipe_title: titles.get(log.recipe_id) ?? "料理",
  }));
}
