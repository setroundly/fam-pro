"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { FamilyInviteLanding } from "@/components/FamilyInviteLanding";
import { HomeApp } from "@/components/HomeApp";
import { isActiveFamilyInvite } from "@/lib/familyInvite";

export function FamilyJoinHub({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    setIsMember(isActiveFamilyInvite(inviteCode));
    setReady(true);
  }, [inviteCode]);

  if (!ready) {
    return <p className="text-empty-hint p-8 text-center">読み込み中…</p>;
  }

  if (isMember) {
    return <HomeApp />;
  }

  return (
    <div className="app-shell mx-auto flex min-h-screen max-w-md flex-col px-4 py-6 text-kitchen-ink">
      <header className="mb-6 pt-2">
        <AppLogo showTagline size="md" />
      </header>
      <FamilyInviteLanding
        inviteCode={inviteCode}
        onJoined={() => {
          setIsMember(true);
          router.replace(`/join/${inviteCode}`);
        }}
        onCreateFamily={() => router.push("/")}
      />
    </div>
  );
}
