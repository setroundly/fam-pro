"use client";

import { COPY } from "@/lib/copy";

export function MemoryWelcome({
  monthCooks,
  recipeCount,
}: {
  monthCooks: number;
  recipeCount: number;
}) {
  return (
    <aside className="memory-banner space-y-2 p-4">
      <p className="font-display text-sm font-bold text-kitchen-ink">
        {COPY.home.welcomeTitle}
      </p>
      <p className="text-xs leading-relaxed text-kitchen-muted">
        {COPY.home.welcomeBody}
      </p>
      <div className="flex gap-3 pt-1">
        <Stat label="今月の食卓" value={`${monthCooks} 回`} />
        <Stat label="うちのレシピ" value={`${recipeCount} 品`} />
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-nord border border-kitchen-sky/60 bg-kitchen-card/80 px-3 py-2 text-center">
      <p className="text-[10px] font-bold text-kitchen-muted">{label}</p>
      <p className="font-display text-sm font-bold text-kitchen">{value}</p>
    </div>
  );
}
