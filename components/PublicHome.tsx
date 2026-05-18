import Link from "next/link";
import { AppLogo } from "./AppLogo";
import { Timeline } from "./Timeline";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/branding";

export function PublicHome() {
  return (
    <div className="app-shell flex min-h-screen flex-col text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-fail-border bg-fail-bg px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <AppLogo />
          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-fail px-4 py-2 text-sm font-bold text-white"
          >
            はじめる
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 py-6 pb-12">
        <section className="mb-8">
          <p className="font-display text-lg leading-relaxed text-zinc-200">
            {APP_DESCRIPTION}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{APP_TAGLINE}</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>・締切に負けた失敗がタイムラインに流れる</li>
            <li>・罰金は選んだ寄付先へ（覚悟の証明）</li>
            <li>・懺悔室で仲間と慰め合える</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display mb-3 text-xl text-fail">失敗タイムライン</h2>
          <p className="text-empty-hint mb-4 px-1">
            みんなの失敗を見るだけならログイン不要です
          </p>
          <Timeline />
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-block rounded-2xl bg-gradient-to-r from-fail to-[#e02020] px-8 py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(255,77,77,0.35)]"
          >
            自分もタスクを作る
          </Link>
        </div>
      </main>
    </div>
  );
}
