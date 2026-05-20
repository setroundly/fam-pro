import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, supabaseConfigResponse } from "@/lib/apiRoute";
import {
  RECIPE_PHOTO_BUCKET,
  RECIPE_PHOTO_MAX_BYTES,
  recipePhotoExtension,
  recipePhotoPublicUrl,
} from "@/lib/recipePhoto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const configError = supabaseConfigResponse();
  if (configError) return configError;

  try {
    const formData = await request.formData();
    const familyId = formData.get("familyId");
    const file = formData.get("file");

    if (typeof familyId !== "string" || !familyId) {
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "空のファイルです" }, { status: 400 });
    }
    if (file.size > RECIPE_PHOTO_MAX_BYTES) {
      return NextResponse.json(
        { error: "写真は5MB以下にしてください" },
        { status: 400 }
      );
    }

    const ext = recipePhotoExtension(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "JPEG / PNG / WebP / GIF の写真のみ対応しています" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const path = `${familyId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(RECIPE_PHOTO_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "写真のアップロードに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      photoUrl: recipePhotoPublicUrl(path),
      path,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export const runtime = "nodejs";
