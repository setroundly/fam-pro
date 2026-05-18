"use client";

import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { FailureCard, type TimelinePostWithStreak } from "./FailureCard";

export function Timeline() {
  const [posts, setPosts] = useState<TimelinePostWithStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ error?: string; timeline?: TimelinePostWithStreak[] }>(
        "/api/tasks"
      );
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to load"));
      setPosts(data.timeline ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 30_000);
    return () => clearInterval(interval);
  }, [fetchTimeline]);

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">失敗を読み込み中…</p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
        {error}
        <button
          type="button"
          onClick={fetchTimeline}
          className="mt-2 block text-fail underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-empty-hint py-12">
        まだ失敗がありません。誰かがサボるのを待ちましょう。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <FailureCard
          key={post.id}
          post={post}
          donateUrl={post.donate_url}
        />
      ))}
    </div>
  );
}
