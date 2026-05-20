"use client";

import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { FamilyInviteLanding } from "@/components/FamilyInviteLanding";

export function FamilyInviteJoinPage({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();

  return (
    <div className="app-shell mx-auto flex min-h-screen max-w-md flex-col px-4 py-6 text-kitchen-ink">
      <header className="mb-6 pt-2">
        <AppLogo showTagline={false} size="sm" />
      </header>
      <FamilyInviteLanding
        inviteCode={inviteCode}
        onJoined={() => router.push("/")}
        onCreateFamily={() => router.push("/")}
      />
    </div>
  );
}
