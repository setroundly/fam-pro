import { Suspense } from "react";
import { HomeApp } from "@/components/HomeApp";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-empty-hint p-8">読み込み中…</p>}>
      <HomeApp />
    </Suspense>
  );
}
