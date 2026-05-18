"use client";

import { useCallback, useEffect, useState } from "react";
import { formatJstDateTime, formatJstTime } from "@/lib/datetime";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  USER_NAME_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "@/lib/constants";
import { getConfessionClientKey } from "@/lib/confessionClient";
import type { ConfessionPost } from "@/lib/types";

const COMFORTED_KEY = "fail_donate_comforted_posts";

function getComfortedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(COMFORTED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markComforted(postId: string) {
  const set = getComfortedSet();
  set.add(postId);
  localStorage.setItem(COMFORTED_KEY, JSON.stringify([...set]));
}

export function ConfessionRoom() {
  const [threads, setThreads] = useState<ConfessionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comforted, setComforted] = useState<Set<string>>(new Set());

  const [displayName, setDisplayName] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ threads?: ConfessionPost[] }>(
        "/api/confession"
      );
      if (!res.ok) throw new Error(apiErrorMessage(data, "読み込みに失敗しました"));
      setThreads(data.threads ?? []);
      setComforted(getComfortedSet());
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラー");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDisplayName(localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "");
    fetchThreads();
    const interval = setInterval(fetchThreads, 20_000);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  const submitPost = async (body: string, parentId?: string) => {
    const name = displayName.trim();
    if (!name) {
      setError("名前を入力してください");
      return;
    }
    if (!body.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const userId = localStorage.getItem(USER_STORAGE_KEY) ?? undefined;
      const { res, data } = await fetchJson<{ post?: ConfessionPost; error?: string }>(
        "/api/confession",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: name,
            body: body.trim(),
            parentId,
            userId,
          }),
        }
      );

      if (!res.ok) throw new Error(apiErrorMessage(data, "投稿に失敗しました"));

      localStorage.setItem(USER_NAME_STORAGE_KEY, name);
      setNewBody("");
      setReplyBody("");
      setReplyTo(null);
      await fetchThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  };

  const sendComfort = async (postId: string) => {
    try {
      const { res, data } = await fetchJson<{
        comfortCount?: number;
        already?: boolean;
      }>(`/api/confession/${postId}/comfort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: getConfessionClientKey() }),
      });

      if (!res.ok) return;

      markComforted(postId);
      setComforted(getComfortedSet());

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === postId) {
            return { ...t, comfort_count: data.comfortCount ?? t.comfort_count };
          }
          return {
            ...t,
            replies: t.replies?.map((r) =>
              r.id === postId
                ? { ...r, comfort_count: data.comfortCount ?? r.comfort_count }
                : r
            ),
          };
        })
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-empty-hint px-1">
        失敗も悔いも、ここに置いていけ。慰め合う場所です。
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPost(newBody);
        }}
        className="rounded-2xl border border-fail-border/80 bg-fail-card/80 p-4 backdrop-blur-sm"
      >
        <p className="mb-3 text-xs font-semibold text-zinc-500">新しい懺悔</p>
        <input
          className="input mb-3"
          placeholder="名前"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={32}
          required
        />
        <textarea
          className="input min-h-[88px] resize-none"
          placeholder="今日の失敗、言い訳、本音…"
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          maxLength={800}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full rounded-xl bg-fail py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "送信中…" : "懺悔する"}
        </button>
      </form>

      {error && (
        <p className="rounded-xl border border-fail/30 bg-fail/10 px-3 py-2 text-sm text-fail">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-empty-hint py-8">読み込み中…</p>
      ) : threads.length === 0 ? (
        <p className="text-empty-hint py-12">
          まだ誰も懺悔していません。最初の一人になろう。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              comforted={comforted}
              replyTo={replyTo}
              replyBody={replyBody}
              submitting={submitting}
              onComfort={() => sendComfort(thread.id)}
              onReplyOpen={() => {
                setReplyTo(replyTo === thread.id ? null : thread.id);
                setReplyBody("");
              }}
              onReplyBodyChange={setReplyBody}
              onReplySubmit={() => submitPost(replyBody, thread.id)}
              onReplyComfort={(id) => sendComfort(id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  comforted,
  replyTo,
  replyBody,
  submitting,
  onComfort,
  onReplyOpen,
  onReplyBodyChange,
  onReplySubmit,
  onReplyComfort,
}: {
  thread: ConfessionPost;
  comforted: Set<string>;
  replyTo: string | null;
  replyBody: string;
  submitting: boolean;
  onComfort: () => void;
  onReplyOpen: () => void;
  onReplyBodyChange: (v: string) => void;
  onReplySubmit: () => void;
  onReplyComfort: (id: string) => void;
}) {
  const hasComforted = comforted.has(thread.id);

  return (
    <li className="rounded-2xl border border-fail-border bg-fail-card/90 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-display text-sm text-fail">{thread.display_name}</span>
        <time className="text-[10px] tabular-nums text-zinc-600">
          {formatJstDateTime(thread.created_at)}
        </time>
      </div>

      <p className="font-display text-base leading-relaxed text-zinc-100">
        {thread.body}
      </p>

      <div className="mt-3 flex gap-2">
        <ComfortButton
          count={thread.comfort_count}
          active={hasComforted}
          onClick={onComfort}
        />
        <button
          type="button"
          onClick={onReplyOpen}
          className="rounded-xl border border-fail-border px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
        >
          慰める
        </button>
      </div>

      {thread.replies && thread.replies.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-l-2 border-fail/20 pl-3">
          {thread.replies.map((reply) => (
            <li
              key={reply.id}
              className="rounded-xl bg-zinc-950/40 px-3 py-2.5"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-400">
                  {reply.display_name}
                </span>
                <time className="text-[10px] tabular-nums text-zinc-600">
                  {formatJstTime(reply.created_at)}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{reply.body}</p>
              <div className="mt-2">
                <ComfortButton
                  count={reply.comfort_count}
                  active={comforted.has(reply.id)}
                  onClick={() => onReplyComfort(reply.id)}
                  small
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {replyTo === thread.id && (
        <div className="mt-3 border-t border-fail-border/50 pt-3">
          <textarea
            className="input min-h-[72px] resize-none text-sm"
            placeholder="励ましの言葉を…"
            value={replyBody}
            onChange={(e) => onReplyBodyChange(e.target.value)}
            maxLength={800}
          />
          <button
            type="button"
            disabled={submitting || !replyBody.trim()}
            onClick={onReplySubmit}
            className="mt-2 w-full rounded-xl border border-fail/50 py-2.5 text-sm font-semibold text-fail disabled:opacity-50"
          >
            返信を送る
          </button>
        </div>
      )}
    </li>
  );
}

function ComfortButton({
  count,
  active,
  onClick,
  small,
}: {
  count: number;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={active}
      className={`rounded-xl font-semibold transition ${
        small ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"
      } ${
        active
          ? "bg-fail/20 text-fail"
          : "border border-fail-border bg-zinc-950/50 text-zinc-300 hover:border-fail/50 hover:text-fail"
      }`}
    >
      {active ? "🤝 送った" : "🤝 慰める"} {count > 0 && `(${count})`}
    </button>
  );
}
