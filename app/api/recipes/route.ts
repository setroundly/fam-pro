import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import { linesToArray } from "@/lib/recipeText";
import { isRecipeCategory, isRecipeEvent } from "@/lib/recipeMeta";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveOrCreateUser } from "@/lib/users";

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

const createSchema = z.object({
  familyId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(32),
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

export async function GET(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  const familyId = request.nextUrl.searchParams.get("familyId");
  if (!familyId) {
    return NextResponse.json({ error: "familyId is required" }, { status: 400 });
  }

  const category = request.nextUrl.searchParams.get("category");
  const event = request.nextUrl.searchParams.get("event");

  if (category && !isRecipeCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (event && !isRecipeEvent(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("recipes")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }
    if (event) {
      query = query.contains("events", [event]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recipes: data ?? [] });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
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
    const user = await resolveOrCreateUser(supabase, {
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
    });

    const { data: membership } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", parsed.data.familyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: "この家族のメンバーではありません" },
        { status: 403 }
      );
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({
        family_id: parsed.data.familyId,
        user_id: user.id,
        author_name: parsed.data.displayName,
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
      })
      .select("*")
      .single();

    if (error || !recipe) {
      return NextResponse.json(
        { error: error?.message ?? "レシピの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user, recipe });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
