import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "./types";

export async function resolveOrCreateUser(
  supabase: SupabaseClient,
  params: { userId?: string; displayName: string }
): Promise<User> {
  if (params.userId) {
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.userId)
      .maybeSingle();

    if (existing) {
      if (existing.display_name !== params.displayName) {
        await supabase
          .from("users")
          .update({ display_name: params.displayName })
          .eq("id", existing.id);
      }
      return { ...existing, display_name: params.displayName };
    }
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({ display_name: params.displayName })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "ユーザーの作成に失敗しました");
  }

  return created;
}
