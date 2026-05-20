"use client";

import { buildFamilyInviteUrl } from "@/lib/familyInvite";
import type { FamilyBackup } from "@/lib/session";

interface FamilyReconnectBannerProps {
  backup: FamilyBackup;
  onReconnect: () => void;
  onDismiss: () => void;
}

export function FamilyReconnectBanner({
  backup,
  onReconnect,
  onDismiss,
}: FamilyReconnectBannerProps) {
  return (
    <div className="card-nord mb-4 border-kitchen/40 bg-kitchen-cream/60 p-4">
      <p className="text-sm font-bold text-kitchen-ink">
        {backup.familyName} のレシピ帳に戻れます
      </p>
      <p className="text-empty-hint mt-1 text-left text-xs">
        レシピはクラウドに残っています。URLが変わっても、参加リンクから同じ家族に入り直せば復元できます。
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onReconnect} className="btn-primary flex-1 text-sm">
          再接続する
        </button>
        <button type="button" onClick={onDismiss} className="btn-secondary shrink-0 text-xs">
          閉じる
        </button>
      </div>
      <p className="mt-2 truncate text-[10px] text-kitchen-muted">
        {buildFamilyInviteUrl(backup.inviteCode)}
      </p>
    </div>
  );
}
