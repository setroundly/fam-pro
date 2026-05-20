import { NextRequest, NextResponse } from "next/server";
import { addDays, format } from "date-fns";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { matchesSearch, monthKey } from "@/lib/dates";
import { isRecipeCategory } from "@/lib/recipeMeta";
import {
  attachRecipeTitles,
  buildLastCookedMap,
  enrichRecipes,
  pickStaleRecipes,
} from "@/lib/recipeEnrich";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { CookingLog, FamilyEvent, Recipe, RecipeRequest } from "@/lib/types";

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  const userId = request.nextUrl.searchParams.get("userId");
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const category = request.nextUrl.searchParams.get("category");
  const month = request.nextUrl.searchParams.get("month") ?? monthKey();

  if (!familyId || !userId) {
    return NextResponse.json(
      { error: "familyId and userId are required" },
      { status: 400 }
    );
  }
  if (category && category !== "all" && !isRecipeCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [monthStart, monthEnd] = monthRange(month);

    const [
      recipesRes,
      logsRes,
      monthLogsRes,
      monthEventsRes,
      upcomingEventsRes,
      requestsRes,
      viewsRes,
    ] = await Promise.all([
      supabase
        .from("recipes")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("cooking_logs")
        .select("recipe_id, cooked_on")
        .eq("family_id", familyId),
      supabase
        .from("cooking_logs")
        .select("*")
        .eq("family_id", familyId)
        .gte("cooked_on", monthStart)
        .lte("cooked_on", monthEnd)
        .order("cooked_on", { ascending: true }),
      supabase
        .from("family_events")
        .select("*")
        .eq("family_id", familyId)
        .gte("event_date", monthStart)
        .lte("event_date", monthEnd)
        .order("event_date", { ascending: true }),
      supabase
        .from("family_events")
        .select("*")
        .eq("family_id", familyId)
        .gte("event_date", format(new Date(), "yyyy-MM-dd"))
        .lte("event_date", format(addDays(new Date(), 30), "yyyy-MM-dd"))
        .order("event_date", { ascending: true }),
      supabase
        .from("recipe_requests")
        .select("*")
        .eq("family_id", familyId)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("member_recipe_views")
        .select("last_seen_at")
        .eq("family_id", familyId)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (recipesRes.error) {
      return NextResponse.json({ error: recipesRes.error.message }, { status: 500 });
    }

    const rawRecipes = (recipesRes.data ?? []) as Recipe[];
    const lastCooked = buildLastCookedMap(logsRes.data ?? []);
    let recipes = enrichRecipes(rawRecipes, lastCooked);

    if (category && category !== "all") {
      recipes = recipes.filter((r) => r.category === category);
    }
    if (q.trim()) {
      recipes = recipes.filter((r) => matchesSearch(r, q));
    }

    const staleRecipes = pickStaleRecipes(enrichRecipes(rawRecipes, lastCooked));
    const lastSeenAt =
      viewsRes.data?.last_seen_at ?? "1970-01-01T00:00:00.000Z";
    const newRecipes = rawRecipes.filter(
      (r) => r.user_id !== userId && r.created_at > lastSeenAt
    );

    const cookingLogs = attachRecipeTitles(
      (monthLogsRes.data ?? []) as CookingLog[],
      rawRecipes
    );

    await supabase.from("member_recipe_views").upsert({
      family_id: familyId,
      user_id: userId,
      last_seen_at: new Date().toISOString(),
    });

    return NextResponse.json({
      recipes,
      staleRecipes,
      newRecipes,
      cookingLogs,
      monthEvents: (monthEventsRes.data ?? []) as FamilyEvent[],
      upcomingEvents: (upcomingEventsRes.data ?? []) as FamilyEvent[],
      requests: (requestsRes.data ?? []) as RecipeRequest[],
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

function monthRange(month: string): [string, string] {
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return [start, `${month}-${String(lastDay).padStart(2, "0")}`];
}
