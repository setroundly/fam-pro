import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { linesToArray } from "@/lib/recipeText";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const categorySchema = z.enum(["staple", "main", "side", "sweets", "drink"]);
const eventSchema = z.enum([
  "birthday",
  "anniversary",
  "holiday",
  "new_year",
  "christmas",
  "obon",
  "party",
  "everyday",
]);

const updateSchema = z.object({
  familyId: z.string().uuid(),
  displayName: z.string().min(1).max(32).optional(),
  title: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  category: categorySchema,
  events: z.array(eventSchema).optional().default([]),
  ingredientsText: z.string().min(1),
  stepsText: z.string().min(1),
  prepMinutes: z.number().int().min(0).optional().nullable(),
  cookMinutes: z.number().int().min(0).optional().nullable(),
  servings: z.number().int().min(1).max(99).optional().nullable(),
  tagsText: z.string().optional(),
  photoUrl: z.string().url().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;
  const familyId = request.nextUrl.searchParams.get("familyId");

  try {
    const supabase = getSupabaseAdmin();
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!recipe) {
      return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
    }
    if (familyId && recipe.family_id !== familyId) {
      return NextResponse.json({ error: "アクセスできません" }, { status: 403 });
    }

    const { data: logs } = await supabase
      .from("cooking_logs")
      .select("cooked_on")
      .eq("recipe_id", id)
      .order("cooked_on", { ascending: false });

    const cookDates = (logs ?? []).map((l) => l.cooked_on as string);
    const last_cooked_on = cookDates[0] ?? null;

    return NextResponse.json({
      recipe: {
        ...recipe,
        last_cooked_on,
        cook_count: cookDates.length,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const { id } = await params;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ingredients = linesToArray(parsed.data.ingredientsText);
    const steps = linesToArray(parsed.data.stepsText);
    const tags = linesToArray(parsed.data.tagsText ?? "");

    if (ingredients.length === 0 || steps.length === 0) {
      return NextResponse.json(
        { error: "材料と作り方は1行以上入力してください" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: fetchError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
    }
    if (existing.family_id !== parsed.data.familyId) {
      return NextResponse.json({ error: "アクセスできません" }, { status: 403 });
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .update({
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        category: parsed.data.category,
        events: parsed.data.events,
        ingredients,
        steps,
        prep_minutes: parsed.data.prepMinutes ?? null,
        cook_minutes: parsed.data.cookMinutes ?? null,
        servings: parsed.data.servings ?? null,
        tags,
        photo_url: parsed.data.photoUrl ?? null,
        ...(parsed.data.displayName
          ? { author_name: parsed.data.displayName }
          : {}),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !recipe) {
      return NextResponse.json(
        { error: error?.message ?? "更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
