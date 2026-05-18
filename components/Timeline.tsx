"use client";

import { FailureCard } from "./FailureCard";
import { FailurePostForm } from "./FailurePostForm";
import { useFailuresTimeline } from "@/lib/useFailuresTimeline";
import type { Failure } from "@/lib/types";

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-fail-border/40 bg-fail-card/50"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function Timeline() {
  const { failures, loading, error, newIds, refresh, prependFailure } =
    useFailuresTimeline();

  const handlePosted = (failure: Failure) => {
    prependFailure(failure);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <FailurePostForm onPosted={handlePosted} />
        <p className="text-empty-hint mb-4">タイムラインを読み込み中…</p>
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
        <span className="text-[10px] text-zinc-600">投稿は即時反映</span>
      </div>

      <FailurePostForm onPosted={handlePosted} />

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 block text-fail underline"
          >
            再試行
          </button>
        </div>
      )}

      {!error && failures.length === 0 && (
        <div className="rounded-2xl border border-dashed border-fail-border/60 bg-fail-card/40 px-6 py-12 text-center">
          <p className="font-display text-lg text-zinc-300">まだ失敗がありません</p>
          <p className="text-empty-hint mt-2">
            上のフォームから最初の失敗を投稿するか、
            <br />
            誰かのタスクが締切を過ぎるのを待ちましょう。
          </p>
        </div>
      )}

      {failures.length > 0 && (
        <ul className="flex flex-col gap-4">
          {failures.map((failure) => (
            <li key={failure.id}>
              <FailureCard failure={failure} isNew={newIds.has(failure.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
