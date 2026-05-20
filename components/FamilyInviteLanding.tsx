"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";
import { COPY } from "@/lib/copy";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
  saveFamilyBackup,
  saveSession,
} from "@/lib/session";
import type { Family, User } from "@/lib/types";

interface FamilyInviteLandingProps {
  inviteCode: string;
  onJoined: () => void;
  onCreateFamily: () => void;
}

export function FamilyInviteLanding({
  inviteCode,
  onJoined,
  onCreateFamily,
}: FamilyInviteLandingProps) {
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(getStoredDisplayName());
  }, []);

  useEffect(() => {
    async function loadPreview() {
      setLoadingPreview(true);
      setError(null);
      try {
        const { res, data } = await fetchJson<{
          family?: { name: string; memberCount: number };
          error?: string;
        }>(`/api/families/invite?code=${inviteCode}`);
        if (!res.ok || !data.family) {
          throw new Error(apiErrorMessage(data, "招待リンクが無効です"));
        }
        setFamilyName(data.family.name);
        setMemberCount(data.family.memberCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoadingPreview(false);
      }
    }
    void loadPreview();
  }, [inviteCode]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ user?: User; family?: Family; error?: string }>(
        "/api/families/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: getStoredUserId() ?? undefined,
            displayName: displayName.trim(),
            inviteCode,
          }),
        }
      );
      if (!res.ok || !data.user || !data.family) {
        throw new Error(apiErrorMessage(data, "参加に失敗しました"));
      }

      saveSession({
        userId: data.user.id,
        displayName: data.user.display_name,
        familyId: data.family.id,
        familyName: data.family.name,
      });
      saveFamilyBackup({
        inviteCode: data.family.invite_code,
        familyName: data.family.name,
      });
      onJoined();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPreview) {
    return <p className="text-empty-hint py-12 text-center">レシピ帳を確認中…</p>;
  }

  if (error && !familyName) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-4xl" aria-hidden>
          🍲
        </p>
        <p className="card-nord px-4 py-3 text-sm text-kitchen">{error}</p>
        <button type="button" onClick={onCreateFamily} className="btn-secondary w-full">
          新しく家族をつくる
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center py-6">
      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          🍲
        </p>
        <p className="mt-4 text-xs font-bold tracking-widest text-kitchen-muted uppercase">
          家族のレシピ帳
        </p>
        <h1 className="font-display mt-2 text-3xl text-kitchen-ink">{familyName}</h1>
        <p className="mt-2 text-sm text-kitchen-muted">
          {memberCount > 0 ? `${memberCount} 人が使っています` : "あなたが最初のメンバーです"}
        </p>
      </div>

      <form onSubmit={handleJoin} className="card-nord mt-8 space-y-4 p-5">
        <p className="text-sm leading-relaxed text-kitchen-ink">{COPY.family.inviteWelcome}</p>
        <Field label="あなたの名前" required hint="レシピに残る呼び名です">
          <input
            className="input text-lg"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="たろう"
            maxLength={32}
            autoFocus
            required
          />
        </Field>
        {error && <p className="text-sm text-kitchen">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
          {submitting ? "参加中…" : "レシピ帳を見る"}
        </button>
        <p className="text-center text-[11px] text-kitchen-muted">{COPY.family.noAccountNote}</p>
      </form>

      {!getStoredFamilyId() && (
        <button
          type="button"
          onClick={onCreateFamily}
          className="mt-6 w-full text-xs text-kitchen-muted hover:text-kitchen hover:underline"
        >
          別の家族を新しくつくる
        </button>
      )}
    </div>
  );
}
