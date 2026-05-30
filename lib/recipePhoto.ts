export const RECIPE_PHOTO_BUCKET = "recipe-photos";
export const RECIPE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const RECIPE_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type RecipePhotoMimeType = (typeof RECIPE_PHOTO_MIME_TYPES)[number];

const EXT_BY_MIME: Record<RecipePhotoMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function recipePhotoExtension(mime: string): string | null {
  if (!(RECIPE_PHOTO_MIME_TYPES as readonly string[]).includes(mime)) return null;
  return EXT_BY_MIME[mime as RecipePhotoMimeType];
}

export function recipePhotoPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return path;
  return `${base}/storage/v1/object/public/${RECIPE_PHOTO_BUCKET}/${path}`;
}

export function isRecipePhotoBucketMissing(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("bucket not found") ||
    lower.includes("バケット") ||
    lower.includes("does not exist")
  );
}
