import { redirect } from "next/navigation";
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
  redirect(`/?join=${inviteCode}`);
}
