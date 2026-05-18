"use client";

import { formatJstDateTimeLong, formatJstRelative } from "@/lib/datetime";
import { failureDonationLine, failureHeadline } from "@/lib/failures";
import type { Failure } from "@/lib/types";
import { SupportButtons } from "./SupportButtons";
import { APP_NAME } from "@/lib/branding";
import { getAppBaseUrl } from "@/lib/constants";

interface FailureCardProps {
  failure: Failure;
  isNew?: boolean;
}

export function FailureCard({ failure, isNew }: FailureCardProps) {
  const imageUrl = failure.task_id
    ? `${getAppBaseUrl()}/api/image-card/${failure.task_id}`
    : null;

  const handleShare = async () => {
    const shareText = `${failureHeadline(failure)} — ${failure.description}`;
    const shareData = {
      title: APP_NAME,
      text: shareText,
      url: imageUrl ?? window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through
      }
    }

    await navigator.clipboard.writeText(shareText);
    alert("失敗文をコピーしました");
  };

  return (
    <article
      className={`rounded-2xl border bg-fail-card p-4 shadow-lg transition-colors ${
        isNew
          ? "failure-enter border-fail shadow-[0_0_28px_rgba(255,77,77,0.25)]"
          : "border-fail-border"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-fail">
            {failureHeadline(failure)}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-200">
            『{failure.title}』
          </p>
        </div>
        {(failure.consecutive_fail_count ?? 0) > 1 && (
          <span className="font-display shrink-0 rounded-full bg-fail/20 px-2.5 py-1 text-xs text-fail">
            連続{failure.consecutive_fail_count}敗
          </span>
        )}
      </div>

      <p className="mb-2 text-sm leading-relaxed text-zinc-300">
        {failure.description}
      </p>

      <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-fail/15 px-3 py-1 text-xs font-bold text-fail">
        💸 {failureDonationLine(failure)}
      </p>

      <p className="mb-3 text-xs text-zinc-500">
        <time dateTime={failure.created_at} className="tabular-nums" title={formatJstDateTimeLong(failure.created_at)}>
          {formatJstRelative(failure.created_at)}
        </time>
        <span className="mx-1 text-zinc-700">·</span>
        <span className="text-zinc-600">{formatJstDateTimeLong(failure.created_at)} JST</span>
      </p>

      {(failure.donation_destination || failure.donate_url) && (
        <SupportButtons
          donateUrl={failure.donate_url}
          donationDestination={failure.donation_destination ?? undefined}
        />
      )}

      {imageUrl && (
        <CardActions imageUrl={imageUrl} onShare={handleShare} />
      )}
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
