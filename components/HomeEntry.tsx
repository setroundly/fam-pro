"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeApp } from "@/components/HomeApp";
import { familyJoinPath, getActiveInviteCode } from "@/lib/familyInvite";
import { getStoredFamilyId } from "@/lib/session";

export function HomeEntry() {
  const router = useRouter();
  const inviteCode = getActiveInviteCode();
  const hasFamily = Boolean(getStoredFamilyId());

  useEffect(() => {
    if (hasFamily && inviteCode) {
      router.replace(familyJoinPath(inviteCode));
    }
  }, [hasFamily, inviteCode, router]);

  if (hasFamily && inviteCode) {
    return <p className="text-empty-hint p-8 text-center">レシピ帳を開いています…</p>;
  }

  return <HomeApp />;
}
