"use client";

import { SETROUNDLY_URL, DEFAULT_DONATE_URL } from "@/lib/constants";

interface SupportButtonsProps {
  donateUrl?: string | null;
  donationDestination?: string;
}

export function SupportButtons({
  donateUrl,
  donationDestination,
}: SupportButtonsProps) {
  const donateHref = donateUrl || DEFAULT_DONATE_URL;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        href={SETROUNDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-xl border border-fail-border bg-fail-card px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-fail-muted"
      >
        SETROUNDLYを応援する
      </a>
      <a
        href={donateHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-xl bg-fail px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-fail-muted"
      >
        {donationDestination ? `${donationDestination}へ寄付` : "寄付リンク"}
      </a>
    </div>
  );
}
