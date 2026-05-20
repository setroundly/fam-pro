export interface User {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
}

export type RecipeCategory = "staple" | "main" | "side" | "sweets" | "drink";

export type RecipeEvent =
  | "birthday"
  | "anniversary"
  | "holiday"
  | "new_year"
  | "christmas"
  | "obon"
  | "party"
  | "everyday";

export interface Recipe {
  id: string;
  family_id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  category: RecipeCategory;
  events: RecipeEvent[];
  tags: string[];
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
  last_cooked_on?: string | null;
  cook_count?: number;
}

export interface CookingLog {
  id: string;
  family_id: string;
  recipe_id: string;
  user_id: string;
  cooked_by_name: string;
  cooked_on: string;
  note: string;
  created_at: string;
  recipe_title?: string;
}

export interface RecipeRequest {
  id: string;
  family_id: string;
  user_id: string;
  requester_name: string;
  title: string;
  note: string;
  status: "open" | "done";
  created_at: string;
}

export interface FamilyEvent {
  id: string;
  family_id: string;
  user_id: string;
  title: string;
  event_type: string;
  event_date: string;
  created_at: string;
}

export interface FamilyLink {
  id: string;
  family_id: string;
  user_id: string;
  author_name: string;
  title: string;
  url: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  recipes: Recipe[];
  staleRecipes: Recipe[];
  newRecipes: Recipe[];
  cookingLogs: CookingLog[];
  monthEvents: FamilyEvent[];
  upcomingEvents: FamilyEvent[];
  requests: RecipeRequest[];
}

export interface AdminRecipeRow extends Recipe {
  family_name: string;
}

export interface FamilyInfo extends Family {
  member_count: number;
  members?: FamilyMember[];
}
