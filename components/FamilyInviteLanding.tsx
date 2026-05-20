"use client";

import { useEffect, useState } from "react";
import { COPY } from "@/lib/copy";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
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

  async function handleJoin() {
    if (!displayName.trim()) {
      setError("呼び名を入力してください");
      return;
    }

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
        inviteCode: data.family.invite_code,
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
    <div className="mx-auto flex flex-1 flex-col justify-center pb-8">
      <div className="mb-6 rounded-nord border-2 border-kitchen/30 bg-kitchen-cream/70 px-4 py-3 text-center">
        <p className="text-sm font-bold text-kitchen">{COPY.family.noLoginBadge}</p>
        <p className="mt-1 text-xs text-kitchen-muted">{COPY.family.noLoginDetail}</p>
      </div>

      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          🍲
        </p>
        <p className="mt-4 text-xs font-bold tracking-widest text-kitchen-muted uppercase">
          招待されています
        </p>
        <h1 className="font-display mt-2 text-3xl text-kitchen-ink">{familyName}</h1>
        <p className="mt-2 text-sm text-kitchen-muted">
          {memberCount > 0 ? `${memberCount} 人が使っています` : "あなたが最初のメンバーです"}
        </p>
      </div>

      <div className="card-nord mt-8 space-y-4 p-5">
        <p className="text-sm leading-relaxed text-kitchen-ink">{COPY.family.inviteWelcome}</p>

        <div className="space-y-1.5">
          <span className="text-xs font-bold tracking-wide text-kitchen-ink">
            台所での呼び名<span className="text-kitchen"> *</span>
          </span>
          <span className="block text-[11px] text-kitchen-muted">
            レシピに残る名前です（メール・パスワードは不要）
          </span>
          <input
            className="input text-lg"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="たろう"
            maxLength={32}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            name="kitchen-display-name"
            id="kitchen-display-name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleJoin();
              }
            }}
          />
        </div>

        {error && <p className="text-sm text-kitchen">{error}</p>}

        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleJoin()}
          className="btn-primary w-full text-base"
        >
          {submitting ? "開いています…" : "レシピ帳を見る"}
        </button>
      </div>

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
