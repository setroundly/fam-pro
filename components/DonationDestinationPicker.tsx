"use client";

import {
  DONATION_DESTINATIONS,
  type DonationDestinationId,
  type DonationDestinationOption,
} from "@/lib/donationDestinations";
import { DonationLogo } from "./donation/DonationLogo";
import { Field } from "./ui/Field";

interface DonationDestinationPickerProps {
  selectedId: DonationDestinationId | null;
  customName: string;
  customUrl: string;
  onSelect: (option: DonationDestinationOption) => void;
  onCustomNameChange: (name: string) => void;
  onCustomUrlChange: (url: string) => void;
}

export function DonationDestinationPicker({
  selectedId,
  customName,
  customUrl,
  onSelect,
  onCustomNameChange,
  onCustomUrlChange,
}: DonationDestinationPickerProps) {
  const isOther = selectedId === "other";
  const selected = DONATION_DESTINATIONS.find((d) => d.id === selectedId);

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="失敗したら届ける先"
        hint="タップして寄付先を選ぶ — 覚悟の行き先"
        required
      >
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 snap-x snap-mandatory">
            {DONATION_DESTINATIONS.map((option) => {
              const active = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option)}
                  className={[
                    "group relative flex w-[132px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border p-3 text-left transition duration-200",
                    "active:scale-[0.98]",
                    active
                      ? "border-fail bg-gradient-to-b from-fail/25 to-fail-card shadow-[0_0_24px_rgba(255,77,77,0.35)] ring-1 ring-fail/60"
                      : "border-fail-border/70 bg-fail-card/90 hover:border-zinc-500 hover:shadow-lg",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-20 transition group-hover:opacity-30 ${option.accent}`}
                  />
                  <div className="relative flex flex-col gap-2.5">
                    <DonationLogo id={option.logoKey} />
                    <div>
                      <p className="text-sm font-bold leading-tight text-zinc-100">
                        {option.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        {option.tagline}
                      </p>
                    </div>
                  </div>
                  {active && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fail shadow-[0_0_8px_#ff4d4d]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selected && selected.id !== "other" && (
          <p className="mt-2 rounded-xl border border-fail-border/50 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
            <span className="text-fail">選択中:</span> {selected.name}
            <span className="mx-1 text-zinc-600">·</span>
            寄付ページを自動設定済み
          </p>
        )}
      </Field>

      {isOther && (
        <div className="flex flex-col gap-3">
          <Field label="寄付先名（その他）" required>
            <input
              className="input"
              value={customName}
              onChange={(e) => onCustomNameChange(e.target.value)}
              placeholder="例: 地域のNPO"
              required
              maxLength={120}
            />
          </Field>
          <Field label="寄付ページURL" required>
            <input
              type="url"
              className="input"
              value={customUrl}
              onChange={(e) => onCustomUrlChange(e.target.value)}
              placeholder="https://..."
              required
            />
          </Field>
        </div>
      )}
    </div>
  );
}
