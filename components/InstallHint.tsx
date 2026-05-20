"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "marutto_install_hint_dismissed";

function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobileBrowser() || isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[4.5rem] left-3 right-3 z-30 mx-auto max-w-md">
      <div className="card-nord flex items-start gap-3 border-kitchen/40 bg-kitchen-card/95 p-3 shadow-nord backdrop-blur-sm">
        <span className="text-xl" aria-hidden>
          📲
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-kitchen-ink">ホーム画面に追加</p>
          <p className="mt-0.5 text-xs leading-relaxed text-kitchen-muted">
            ブラウザのメニューから「ホーム画面に追加」すると、アプリのように使えます。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
          className="shrink-0 rounded border border-kitchen-border px-2 py-1 text-[10px] text-kitchen-muted"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
