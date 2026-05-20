"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { COPY } from "@/lib/copy";
import { buildFamilyInviteUrl, familyJoinPath, parseInviteCode } from "@/lib/familyInvite";
import {
  clearFamilySession,
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
  saveFamilyBackup,
  saveSession,
} from "@/lib/session";
import type { Family, FamilyInfo, User } from "@/lib/types";

type Mode = "choose" | "create" | "join";

interface FamilyPanelProps {
  onFamilyReady: () => void;
}

export function FamilyPanel({ onFamilyReady }: FamilyPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [displayName, setDisplayName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      saveFamilyBackup({
        inviteCode: data.family.invite_code,
        familyName: data.family.name,
      });
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

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = parseInviteCode(inviteCode);
    if (!code) {
      setError("6文字のコードを確認してください");
      return;
    }
    router.push(`/join/${code}`);
  }

  function finishJoin(user: User, family: Family) {
    saveSession({
      userId: user.id,
      displayName: user.display_name,
      familyId: family.id,
      familyName: family.name,
    });
    saveFamilyBackup({
      inviteCode: family.invite_code,
      familyName: family.name,
    });
    setFamilyInfo({ ...family, member_count: 1 });
    setMode("choose");
    onFamilyReady();
    void loadFamily();
    router.replace(familyJoinPath(family.invite_code));
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

  async function copyInviteLink() {
    if (!familyInfo?.invite_code) return;
    await navigator.clipboard.writeText(buildFamilyInviteUrl(familyInfo.invite_code));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function exportRecipes() {
    const id = getStoredFamilyId();
    if (!id || !familyInfo) return;
    setExporting(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{
        family?: { name: string };
        recipes?: unknown[];
        error?: string;
      }>(`/api/families/export?familyId=${id}`);
      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "エクスポートに失敗しました"));
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${familyInfo.name}-recipes-${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setExporting(false);
    }
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
          <p className="text-sm font-semibold text-kitchen-ink">家族を招待</p>
          <p className="text-empty-hint mt-1 text-left">{COPY.family.inviteLinkHint}</p>
          <p className="mt-2 truncate text-xs text-kitchen-muted">
            {buildFamilyInviteUrl(familyInfo.invite_code)}
          </p>
          <button
            type="button"
            onClick={() => void copyInviteLink()}
            className="btn-primary mt-4 w-full text-sm"
          >
            {linkCopied ? "リンクをコピーしました" : "参加リンクをコピー"}
          </button>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-kitchen-muted">
              コードを手入力する場合（6文字）
            </summary>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-[0.35em] text-kitchen">
                {familyInfo.invite_code}
              </span>
              <button
                type="button"
                onClick={() => void copyInviteCode()}
                className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
              >
                {copied ? "コピー済" : "コピー"}
              </button>
            </div>
          </details>
        </div>

        <div className="card-nord space-y-3 p-5">
          <p className="text-sm font-semibold text-kitchen-ink">レシピ帳の安心メモ</p>
          <p className="text-empty-hint text-left text-xs">{COPY.family.dataSafeNote}</p>
          <p className="text-empty-hint text-left text-xs">{COPY.family.backupHint}</p>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void exportRecipes()}
            className="btn-secondary w-full text-sm"
          >
            {exporting ? "ダウンロード中…" : "レシピをバックアップ（JSON）"}
          </button>
          <p className="text-empty-hint text-left text-[10px]">{COPY.family.exportHint}</p>
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
      {mode === "choose" && (
        <div className="space-y-3">
          <p className="text-empty-hint text-left">{COPY.family.noAccountNote}</p>
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
            className="btn-secondary w-full text-sm"
          >
            コードだけ持っている
          </button>
        </div>
      )}

      {(mode === "create" || mode === "join") && (
        <form
          onSubmit={mode === "create" ? handleCreate : handleJoin}
          className="space-y-4"
        >
          {mode === "create" && (
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
          )}

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
            <Field label="招待コード（6文字）" required hint={COPY.family.codeHint}>
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
            {loading ? "処理中…" : mode === "create" ? "家族を作成" : "参加ページへ"}
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
