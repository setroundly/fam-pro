"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-shell mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl" aria-hidden>
        😿
      </p>
      <h1 className="section-title mt-4">うまく表示できませんでした</h1>
      <p className="text-empty-hint mt-2">
        通信状況を確認して、もう一度お試しください。
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6 w-full max-w-xs">
        再読み込み
      </button>
    </main>
  );
}
