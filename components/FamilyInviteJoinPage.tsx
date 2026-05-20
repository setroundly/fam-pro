"use client";

import { useRouter } from "next/navigation";
import { FamilyInviteLanding } from "@/components/FamilyInviteLanding";

export function FamilyInviteJoinPage({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();

  return (
    <div className="app-shell mx-auto min-h-screen max-w-md px-4 py-6 text-kitchen-ink">
      <FamilyInviteLanding
        inviteCode={inviteCode}
        onJoined={() => router.push("/")}
        onCreateFamily={() => router.push("/")}
      />
    </div>
  );
}
