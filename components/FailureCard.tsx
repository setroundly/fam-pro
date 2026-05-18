"use client";

import { formatJstDateTimeLong } from "@/lib/datetime";
import type { TimelinePost } from "@/lib/types";
import { SupportButtons } from "./SupportButtons";
import { APP_NAME } from "@/lib/branding";
import { getAppBaseUrl } from "@/lib/constants";

export interface TimelinePostWithStreak extends TimelinePost {
  consecutive_fail_count?: number;
  donate_url?: string | null;
}

interface FailureCardProps {
  post: TimelinePostWithStreak;
  donateUrl?: string | null;
}

export function FailureCard({ post, donateUrl }: FailureCardProps) {
  const imageUrl = `${getAppBaseUrl()}/api/image-card/${post.task_id}`;

  const handleShare = async () => {
    const shareData = {
      title: APP_NAME,
      text: post.body,
      url: imageUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through
      }
    }

    await navigator.clipboard.writeText(post.body);
    alert("失敗文をコピーしました");
  };

  return (
    <article className="rounded-2xl border border-fail-border bg-fail-card p-4 shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="font-display text-lg font-normal leading-relaxed text-zinc-100">
          {post.body}
        </p>
        {(post.consecutive_fail_count ?? 0) > 1 && (
          <span className="font-display shrink-0 rounded-full bg-fail/20 px-2.5 py-1 text-xs text-fail">
            連続{post.consecutive_fail_count}敗
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-zinc-500">
        <time dateTime={post.created_at} className="tabular-nums">
          {formatJstDateTimeLong(post.created_at)}
        </time>
        <span className="ml-1 text-zinc-600">JST</span>
        {" · "}
        寄付先: {post.donation_destination}
      </p>

      <SupportButtons
        donateUrl={donateUrl}
        donationDestination={post.donation_destination}
      />

      <CardActions imageUrl={imageUrl} onShare={handleShare} />
    </article>
  );
}

function CardActions({
  imageUrl,
  onShare,
}: {
  imageUrl: string;
  onShare: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-xl border border-fail-border py-2.5 text-center text-xs font-medium text-zinc-300 hover:text-white"
      >
        失敗カード画像
      </a>
      <button
        type="button"
        onClick={onShare}
        className="flex-1 rounded-xl border border-fail-border py-2.5 text-center text-xs font-medium text-zinc-300 hover:text-white"
      >
        シェア
      </button>
    </div>
  );
}
