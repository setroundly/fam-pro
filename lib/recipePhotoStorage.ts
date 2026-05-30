import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isRecipePhotoBucketMissing,
  RECIPE_PHOTO_BUCKET,
  RECIPE_PHOTO_MAX_BYTES,
  RECIPE_PHOTO_MIME_TYPES,
} from "@/lib/recipePhoto";

export async function ensureRecipePhotoBucket(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return { ok: false, error: listError.message };
  }

  const exists = buckets?.some(
    (bucket) => bucket.id === RECIPE_PHOTO_BUCKET || bucket.name === RECIPE_PHOTO_BUCKET
  );
  if (exists) return { ok: true };

  const { error: createError } = await supabase.storage.createBucket(RECIPE_PHOTO_BUCKET, {
    public: true,
    fileSizeLimit: RECIPE_PHOTO_MAX_BYTES,
    allowedMimeTypes: [...RECIPE_PHOTO_MIME_TYPES],
  });

  if (createError) {
    const lower = createError.message.toLowerCase();
    if (lower.includes("already") || lower.includes("exists")) {
      return { ok: true };
    }
    return { ok: false, error: createError.message };
  }

  return { ok: true };
}

export function recipePhotoUploadErrorMessage(message: string): string {
  if (isRecipePhotoBucketMissing(message)) {
    return "写真の保存先（Storage バケット recipe-photos）が見つかりません。Supabase の SQL Editor で supabase/既存DB用-レシピ写真追加.sql を実行してください。";
  }
  return message || "写真のアップロードに失敗しました";
}
