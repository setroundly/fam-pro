"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { TaskForm } from "./TaskForm";
import { MyTasks } from "./MyTasks";
import { ConfessionRoom } from "./ConfessionRoom";
import { AppLogo } from "./AppLogo";
import { useSession } from "@/lib/useSession";

type Tab = "create" | "mine" | "confession";

export function HomeApp() {
  const [tab, setTab] = useState<Tab>("create");
  const [taskRefresh, setTaskRefresh] = useState(0);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, loading, logout } = useSession();

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.replace("/login?next=/app");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <p className="p-8 text-center text-zinc-500">読み込み中…</p>
    );
  }

  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="app-shell flex min-h-screen flex-col text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-fail-border bg-fail-bg px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/">
            <AppLogo size="sm" showTagline={false} />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logout()}
              className="text-[10px] text-zinc-500 underline"
            >
              ログアウト
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg border border-fail-border px-3 py-1.5 text-xs text-zinc-400"
              aria-label="テーマ切替"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 py-4 pb-24">
        {tab === "create" && (
          <section>
            <h2 className="font-display mb-1 text-xl text-fail">覚悟を決める</h2>
            <p className="text-empty-hint mb-5">
              失敗したら、選んだ先へ強制送還。
            </p>
            <TaskForm
              onCreated={() => {
                setTaskRefresh((k) => k + 1);
                setTab("mine");
              }}
            />
          </section>
        )}
        {tab === "mine" && (
          <section>
            <h2 className="font-display mb-3 text-xl text-fail">自分のタスク</h2>
            <MyTasks refreshKey={taskRefresh} />
          </section>
        )}
        {tab === "confession" && (
          <section>
            <h2 className="font-display mb-1 text-xl text-fail">懺悔室</h2>
            <ConfessionRoom />
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-fail-border bg-fail-card">
        <div className="mx-auto flex max-w-md">
          <TabButton
            active={tab === "create"}
            onClick={() => setTab("create")}
            label="作成"
          />
          <TabButton
            active={tab === "mine"}
            onClick={() => setTab("mine")}
            label="自分"
          />
          <TabButton
            active={tab === "confession"}
            onClick={() => setTab("confession")}
            label="懺悔室"
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-center text-xs font-semibold transition ${
        active
          ? "text-fail border-t-2 border-fail"
          : "text-zinc-500 border-t-2 border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
