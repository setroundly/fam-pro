import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FamilyInviteJoinPage } from "@/components/FamilyInviteJoinPage";
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
      <FamilyInviteJoinPage inviteCode={inviteCode} />
    </Suspense>
  );
}
