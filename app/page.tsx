import { Suspense } from "react";
import { HomeEntry } from "@/components/HomeEntry";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-empty-hint p-8">読み込み中…</p>}>
      <HomeEntry />
    </Suspense>
  );
}
