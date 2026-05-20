"use client";

import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  clearFamilySession,
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
  saveSession,
} from "@/lib/session";
import type { Family, FamilyInfo, User } from "@/lib/types";

type Mode = "choose" | "create" | "join";

interface FamilyPanelProps {
  onFamilyReady: () => void;
}

export function FamilyPanel({ onFamilyReady }: FamilyPanelProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [displayName, setDisplayName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const familyId = getStoredFamilyId();

  const loadFamily = useCallback(async () => {
    const id = getStoredFamilyId();
    if (!id) {
      setFamilyInfo(null);
      return;
    }

    const { res, data } = await fetchJson<{ family?: FamilyInfo; error?: string }>(
      `/api/families?familyId=${id}`
    );
    if (res.ok && data.family) {
      setFamilyInfo(data.family);
    }
  }, []);

  useEffect(() => {
    setDisplayName(getStoredDisplayName());
    void loadFamily();
  }, [loadFamily]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await fetchJson<{ user?: User; family?: Family; error?: string }>(
        "/api/families",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: getStoredUserId() ?? undefined,
            displayName: displayName.trim(),
            familyName: familyName.trim(),
          }),
        }
      );
      if (!res.ok || !data.user || !data.family) {
        throw new Error(apiErrorMessage(data, "家族の作成に失敗しました"));
      }
      finishJoin(data.user, data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await fetchJson<{ user?: User; family?: Family; error?: string }>(
        "/api/families/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: getStoredUserId() ?? undefined,
            displayName: displayName.trim(),
            inviteCode: inviteCode.trim().toUpperCase(),
          }),
        }
      );
      if (!res.ok || !data.user || !data.family) {
        throw new Error(apiErrorMessage(data, "参加に失敗しました"));
      }
      finishJoin(data.user, data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function finishJoin(user: User, family: Family) {
    saveSession({
      userId: user.id,
      displayName: user.display_name,
      familyId: family.id,
      familyName: family.name,
    });
    setFamilyInfo({ ...family, member_count: 1 });
    setMode("choose");
    onFamilyReady();
    void loadFamily();
  }

  function handleLeave() {
    if (!confirm("家族から退出しますか？レシピは家族に残ります。")) return;
    clearFamilySession();
    setFamilyInfo(null);
    setMode("choose");
    onFamilyReady();
  }

  async function copyInviteCode() {
    if (!familyInfo?.invite_code) return;
    await navigator.clipboard.writeText(familyInfo.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (familyId && familyInfo) {
    return (
      <div className="space-y-4">
        <div className="card-nord p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-kitchen-muted">
            あなたの家族
          </p>
          <h3 className="font-display mt-1 text-2xl text-kitchen-ink">{familyInfo.name}</h3>
          <p className="mt-2 text-sm text-kitchen-muted">
            メンバー {familyInfo.member_count} 人
          </p>
        </div>

        <div className="card-nord border-dashed bg-kitchen-cream/50 p-5">
          <p className="text-sm font-semibold text-kitchen-ink">
            招待コード
          </p>
          <p className="text-empty-hint mt-1 text-left">
            家族に共有して、同じレシピ帳に参加してもらいましょう。
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-[0.35em] text-kitchen">
              {familyInfo.invite_code}
            </span>
            <button
              type="button"
              onClick={() => void copyInviteCode()}
              className="btn-secondary shrink-0 px-4 py-2 text-sm"
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLeave}
          className="w-full rounded-nord border-2 border-kitchen-border bg-kitchen-card px-4 py-3 text-sm text-kitchen-muted transition hover:border-kitchen"
        >
          別の家族に切り替える
        </button>
      </div>
    );
  }

  if (familyId && !familyInfo) {
    return <p className="text-empty-hint py-8">家族情報を読み込み中…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-empty-hint text-left">
        はじめに家族を作成するか、招待コードで参加してください。
      </p>

      {mode === "choose" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMode("create")}
            className="btn-primary w-full"
          >
            新しい家族をつくる
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className="btn-secondary w-full"
          >
            招待コードで参加
          </button>
        </div>
      )}

      {(mode === "create" || mode === "join") && (
        <form
          onSubmit={mode === "create" ? handleCreate : handleJoin}
          className="space-y-4"
        >
          <Field label="あなたの名前" required>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="たろう"
              maxLength={32}
              required
            />
          </Field>

          {mode === "create" ? (
            <Field label="家族の名前" required hint="例: 田中家、ママの台所">
              <input
                className="input"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="うちの台所"
                maxLength={40}
                required
              />
            </Field>
          ) : (
            <Field label="招待コード（6文字）" required>
              <input
                className="input font-mono uppercase tracking-widest"
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                placeholder="ABC123"
                maxLength={6}
                minLength={6}
                required
              />
            </Field>
          )}

          {error && (
            <p className="card-nord px-4 py-3 text-sm text-kitchen">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "処理中…" : mode === "create" ? "家族を作成" : "参加する"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("choose");
              setError(null);
            }}
            className="w-full text-sm text-kitchen-muted"
          >
            戻る
          </button>
        </form>
      )}
    </div>
  );
}
