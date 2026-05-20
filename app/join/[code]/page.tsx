import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FamilyJoinHub } from "@/components/FamilyJoinHub";
import { parseInviteCode } from "@/lib/familyInvite";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const inviteCode = parseInviteCode(code);
  if (!inviteCode) {
    redirect("/");
  }

  return (
    <Suspense fallback={<p className="text-empty-hint p-8">読み込み中…</p>}>
      <FamilyJoinHub inviteCode={inviteCode} />
    </Suspense>
  );
}
