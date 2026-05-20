import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-shell mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl" aria-hidden>
        🍲
      </p>
      <h1 className="section-title mt-4">ページが見つかりません</h1>
      <p className="text-empty-hint mt-2">
        リンクが古いか、ページが移動した可能性があります。
      </p>
      <Link href="/" className="btn-primary mt-6 w-full max-w-xs">
        ホームへ戻る
      </Link>
    </main>
  );
}
