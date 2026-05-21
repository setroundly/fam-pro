"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryPicker, EventPicker } from "@/components/RecipeMetaChips";
import { IngredientList } from "@/components/IngredientList";
import { Field } from "@/components/ui/Field";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { COPY } from "@/lib/copy";
import type { RecipeCategory, RecipeEvent } from "@/lib/recipeMeta";
import { arrayToLines, linesToArray } from "@/lib/recipeText";
import {
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredFamilyName,
  getStoredUserId,
  saveSession,
} from "@/lib/session";
import type { Recipe, User } from "@/lib/types";

interface RecipeFormProps {
  recipeId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}

export function RecipeForm({ recipeId, onSaved, onCancel }: RecipeFormProps) {
  const isEdit = Boolean(recipeId);
  const [displayName, setDisplayName] = useState(getStoredDisplayName());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("main");
  const [events, setEvents] = useState<RecipeEvent[]>([]);
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [servings, setServings] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  function clearPhotoPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPhotoPreview(null);
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!recipeId) return;

    async function loadRecipe() {
      setLoadingRecipe(true);
      setError(null);
      const familyId = getStoredFamilyId();
      const query = familyId ? `?familyId=${familyId}` : "";
      try {
        const { res, data } = await fetchJson<{ recipe?: Recipe; error?: string }>(
          `/api/recipes/${recipeId}${query}`
        );
        if (!res.ok || !data.recipe) {
          throw new Error(apiErrorMessage(data, "レシピの読み込みに失敗しました"));
        }
        const r = data.recipe;
        setTitle(r.title);
        setDescription(r.description);
        setCategory(r.category ?? "main");
        setEvents((r.events ?? []) as RecipeEvent[]);
        setIngredientsText(arrayToLines(r.ingredients));
        setStepsText(arrayToLines(r.steps));
        setPrepMinutes(r.prep_minutes != null ? String(r.prep_minutes) : "");
        setCookMinutes(r.cook_minutes != null ? String(r.cook_minutes) : "");
        setServings(r.servings != null ? String(r.servings) : "");
        setTagsText(r.tags.join("\n"));
        setExistingPhotoUrl(r.photo_url ?? null);
        setRemovePhoto(false);
        clearPhotoPreview();
        setPhotoFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoadingRecipe(false);
      }
    }

    void loadRecipe();
  }, [recipeId]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    clearPhotoPreview();
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPhotoPreview(objectUrl);
    setPhotoFile(file);
    setRemovePhoto(false);
  }

  function handleRemovePhoto() {
    clearPhotoPreview();
    setPhotoFile(null);
    setRemovePhoto(true);
  }

  async function uploadPhoto(familyId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("familyId", familyId);
    formData.append("file", file);

    const { res, data } = await fetchJson<{ photoUrl?: string; error?: string }>(
      "/api/recipe-photos",
      { method: "POST", body: formData }
    );

    if (!res.ok || !data.photoUrl) {
      throw new Error(apiErrorMessage(data, "写真のアップロードに失敗しました"));
    }

    return data.photoUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const familyId = getStoredFamilyId();
    if (!familyId) {
      setError("先に「家族」タブで家族を作成または参加してください");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (removePhoto) {
        photoUrl = null;
      } else if (photoFile) {
        photoUrl = await uploadPhoto(familyId, photoFile);
      } else if (existingPhotoUrl) {
        photoUrl = existingPhotoUrl;
      }

      const payload = {
        familyId,
        userId: getStoredUserId() ?? undefined,
        displayName: displayName.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        events,
        ingredientsText,
        stepsText,
        prepMinutes: prepMinutes ? Number(prepMinutes) : null,
        cookMinutes: cookMinutes ? Number(cookMinutes) : null,
        servings: servings ? Number(servings) : null,
        tagsText,
        photoUrl,
      };

      const { res, data } = await fetchJson<{
        user?: User;
        recipe?: Recipe;
        error?: string;
      }>(
        isEdit ? `/api/recipes/${recipeId}` : "/api/recipes",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok || !data.recipe) {
        throw new Error(
          apiErrorMessage(data, isEdit ? "更新に失敗しました" : "レシピの保存に失敗しました")
        );
      }

      if (data.user) {
        saveSession({
          userId: data.user.id,
          displayName: data.user.display_name,
          familyId,
          familyName: getStoredFamilyName(),
        });
      }

      if (!isEdit) {
        setTitle("");
        setDescription("");
        setCategory("main");
        setEvents([]);
        setIngredientsText("");
        setStepsText("");
        setPrepMinutes("");
        setCookMinutes("");
        setServings("");
        setTagsText("");
        clearPhotoPreview();
        setPhotoFile(null);
        setExistingPhotoUrl(null);
        setRemovePhoto(false);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (loadingRecipe) {
    return <p className="text-empty-hint py-8">レシピを読み込み中…</p>;
  }

  const displayPhoto = removePhoto ? null : photoPreview ?? existingPhotoUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEdit && (
        <div className="flex items-center justify-between">
          <h2 className="section-title">レシピを編集</h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-kitchen-muted hover:underline"
            >
              キャンセル
            </button>
          )}
        </div>
      )}

      <Field label="あなたの名前" required>
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={32}
          required
        />
      </Field>

      <Field label="料理名" required>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="おばあちゃんの肉じゃが"
          maxLength={80}
          required
        />
      </Field>

      <Field label="種類" required hint="主食・主菜・副菜など">
        <CategoryPicker value={category} onChange={setCategory} />
      </Field>

      <Field label="イベント" hint="複数選べます（誕生日・祝日など）">
        <EventPicker value={events} onChange={setEvents} />
      </Field>

      <Field label={COPY.recipe.memoryNoteLabel} hint={COPY.recipe.memoryNoteHint}>
        <textarea
          className="input min-h-[72px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={COPY.recipe.memoryNotePlaceholder}
          maxLength={500}
        />
      </Field>

      <Field label={COPY.recipe.photoLabel} hint={COPY.recipe.photoHint}>
        {displayPhoto ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayPhoto}
              alt="レシピ写真プレビュー"
              className="max-h-48 w-full rounded-nord border-2 border-kitchen-border object-cover"
            />
            <div className="flex gap-2">
              <label className="btn-secondary flex-1 cursor-pointer text-center text-xs">
                写真を変更
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="btn-secondary flex-1 text-xs"
              >
                写真を削除
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-nord border-2 border-dashed border-kitchen-border bg-kitchen-cream/40 px-4 py-6 text-center transition hover:border-kitchen">
            <span className="text-2xl">📷</span>
            <span className="mt-2 text-sm font-semibold text-kitchen">写真を選ぶ</span>
            <span className="mt-1 text-xs text-kitchen-muted">JPEG / PNG / WebP · 5MBまで</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </label>
        )}
      </Field>

      <Field
        label="材料"
        required
        hint="1行1材料。名前と量の間は全角スペース（　）かタブで区切ると、量が縦に揃って見えます"
      >
        <textarea
          className="input ingredient-input min-h-[120px] resize-y font-mono text-sm leading-relaxed"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder={"ジャガイモ　　3個\n塩　　　　　　小さじ1\n玉ねぎ　　　　1/2個"}
          spellCheck={false}
          required
        />
        {ingredientsText.trim() ? (
          <div className="mt-3 rounded-nord border border-kitchen-border bg-kitchen-cream/40 p-4">
            <p className="mb-2 text-xs font-semibold text-kitchen-muted">表示プレビュー</p>
            <IngredientList items={linesToArray(ingredientsText)} />
          </div>
        ) : null}
      </Field>

      <Field label="作り方" required hint="1行に1ステップ">
        <textarea
          className="input min-h-[140px] resize-y"
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="下準備（分）">
          <input
            type="number"
            min={0}
            className="input"
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(e.target.value)}
          />
        </Field>
        <Field label="調理（分）">
          <input
            type="number"
            min={0}
            className="input"
            value={cookMinutes}
            onChange={(e) => setCookMinutes(e.target.value)}
          />
        </Field>
        <Field label="人数">
          <input
            type="number"
            min={1}
            max={99}
            className="input"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </Field>
      </div>

      <Field label="タグ" hint="カンマまたは改行区切り（例: 和食, 子ども向け）">
        <input
          className="input"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />
      </Field>

      {error && (
        <p className="card-nord px-4 py-3 text-sm text-kitchen">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "保存中…" : isEdit ? "変更を保存" : "レシピを保存"}
      </button>
    </form>
  );
}
