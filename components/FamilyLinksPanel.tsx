"use client";

import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";
import { COPY } from "@/lib/copy";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
} from "@/lib/session";
import type { FamilyLink } from "@/lib/types";

export function FamilyLinksPanel() {
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editNote, setEditNote] = useState("");

  const load = useCallback(async () => {
    const familyId = getStoredFamilyId();
    if (!familyId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ links?: FamilyLink[]; error?: string }>(
        `/api/family-links?familyId=${familyId}`
      );
      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "読み込みに失敗しました"));
      }
      setLinks(data.links ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitLink(e: React.FormEvent) {
    e.preventDefault();
    const familyId = getStoredFamilyId();
    if (!familyId || !title.trim() || !url.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ error?: string }>("/api/family-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          userId: getStoredUserId(),
          displayName: getStoredDisplayName(),
          title: title.trim(),
          url: url.trim(),
          note: note.trim(),
        }),
      });
      if (!res.ok) throw new Error(apiErrorMessage(data, "保存に失敗しました"));
      setTitle("");
      setUrl("");
      setNote("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(link: FamilyLink) {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditNote(link.note);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
    setEditNote("");
  }

  async function saveEdit(id: string) {
    const familyId = getStoredFamilyId();
    if (!familyId || !editTitle.trim() || !editUrl.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ error?: string }>(`/api/family-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          title: editTitle.trim(),
          url: editUrl.trim(),
          note: editNote.trim(),
        }),
      });
      if (!res.ok) throw new Error(apiErrorMessage(data, "更新に失敗しました"));
      cancelEdit();
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteLink(link: FamilyLink) {
    const familyId = getStoredFamilyId();
    if (!familyId) return;
    if (!confirm(`「${link.title}」を削除しますか？`)) return;

    setError(null);
    try {
      const { res, data } = await fetchJson<{ error?: string }>(
        `/api/family-links/${link.id}?familyId=${familyId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(apiErrorMessage(data, "削除に失敗しました"));
      if (editingId === link.id) cancelEdit();
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    }
  }

  if (loading && links.length === 0) {
    return <p className="text-empty-hint py-8">リンクを読み込み中…</p>;
  }

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h2 className="section-title mb-1">{COPY.links.title}</h2>
        <p className="text-empty-hint text-left">{COPY.links.hint}</p>
      </div>

      {error && (
        <p className="rounded-nord border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="card-nord space-y-3 p-4">
        <h3 className="font-display text-sm font-bold text-kitchen">{COPY.links.addTitle}</h3>
        <form onSubmit={submitLink} className="space-y-2">
          <Field label="タイトル">
            <input
              className="input text-sm"
              placeholder="例: お気に入りのレシピサイト"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="URL">
            <input
              className="input text-sm"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>
          <Field label="メモ（任意）">
            <input
              className="input text-sm"
              placeholder="どんなページか、ひとこと"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <button type="submit" disabled={submitting} className="btn-primary w-full text-sm">
            保存する
          </button>
        </form>
      </section>

      <section className="card-nord space-y-3 p-4">
        <h3 className="font-display text-sm font-bold text-kitchen">{COPY.links.listTitle}</h3>
        {links.length === 0 ? (
          <p className="text-empty-hint text-left text-xs">{COPY.links.empty}</p>
        ) : (
          <ul className="space-y-2">
            {links.map((link) =>
              editingId === link.id ? (
                <li key={link.id} className="space-y-2 rounded-nord border border-kitchen/40 bg-kitchen-cream/40 p-3">
                  <input
                    className="input text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="タイトル"
                  />
                  <input
                    className="input text-sm"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL"
                  />
                  <input
                    className="input text-sm"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="メモ（任意）"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void saveEdit(link.id)}
                      className="btn-primary flex-1 text-xs"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn-secondary flex-1 text-xs"
                    >
                      キャンセル
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={link.id}
                  className="card-nord flex flex-col gap-2 px-3 py-2.5 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-kitchen hover:underline"
                    >
                      {link.title}
                    </a>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(link)}
                        className="rounded border border-kitchen-border px-2 py-0.5 text-[10px] text-kitchen-muted hover:text-kitchen"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteLink(link)}
                        className="rounded border border-kitchen-border px-2 py-0.5 text-[10px] text-kitchen-muted hover:text-red-600"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <p className="truncate text-xs text-kitchen-muted">{link.url}</p>
                  {link.note && (
                    <p className="text-xs text-kitchen-muted">{link.note}</p>
                  )}
                  <p className="text-[10px] text-kitchen-muted">{link.author_name} が保存</p>
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
