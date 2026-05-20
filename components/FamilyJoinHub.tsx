"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { FamilyInviteLanding } from "@/components/FamilyInviteLanding";
import { HomeApp } from "@/components/HomeApp";
import { verifyFamilyMembership } from "@/lib/familyMembership";
import { isActiveFamilyInvite, parseInviteCode } from "@/lib/familyInvite";
import { getStoredFamilyId, getStoredUserId, restoreSession } from "@/lib/session";

export function FamilyJoinHub({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    async function init() {
      const code = parseInviteCode(inviteCode);
      if (!code) {
        setIsMember(false);
        setReady(true);
        return;
      }

      const restored = restoreSession();
      const userId = restored?.userId ?? getStoredUserId();
      const familyId = restored?.familyId ?? getStoredFamilyId();
      const matchesInvite =
        restored?.inviteCode === code || isActiveFamilyInvite(code);

      if (userId && familyId && matchesInvite) {
        const ok = await verifyFamilyMembership(familyId, userId);
        if (ok) {
          setIsMember(true);
          setReady(true);
          return;
        }
      }

      setIsMember(false);
      setReady(true);
    }

    void init();
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
