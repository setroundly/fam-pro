"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { AppLogo } from "./AppLogo";
import { FamilyInviteLanding } from "./FamilyInviteLanding";
import { FamilyLinksPanel } from "./FamilyLinksPanel";
import { FamilyPanel } from "./FamilyPanel";
import { FamilyReconnectBanner } from "./FamilyReconnectBanner";
import { HomeDashboard } from "./HomeDashboard";
import { InstallHint } from "./InstallHint";
import { RecipeDetail } from "./RecipeDetail";
import { RecipeForm } from "./RecipeForm";
import { COPY } from "@/lib/copy";
import { parseInviteCode } from "@/lib/familyInvite";
import { getStoredFamilyId, getStoredFamilyName, getFamilyBackup } from "@/lib/session";

type Tab = "home" | "add" | "family" | "links";

export function HomeApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinFromUrl = parseInviteCode(searchParams.get("join"));

  const [tab, setTab] = useState<Tab>(() => (joinFromUrl ? "family" : "home"));
  const [inviteFromUrl] = useState(() => joinFromUrl);
  const [reconnectInvite, setReconnectInvite] = useState<string | undefined>();
  const [dismissInvite, setDismissInvite] = useState(false);
  const [showReconnectBanner, setShowReconnectBanner] = useState(
    () => !getStoredFamilyId() && Boolean(getFamilyBackup())
  );
  const [recipeRefresh, setRecipeRefresh] = useState(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [hasFamily, setHasFamily] = useState(() => Boolean(getStoredFamilyId()));
  const { theme, setTheme } = useTheme();

  const refreshFamilyState = useCallback(() => {
    setHasFamily(Boolean(getStoredFamilyId()));
  }, []);

  const bumpRefresh = useCallback(() => {
    setRecipeRefresh((k) => k + 1);
  }, []);

  const familyName = getStoredFamilyName();
  const familyBackup = showReconnectBanner && !hasFamily ? getFamilyBackup() : null;
  const activeInviteCode = dismissInvite ? undefined : inviteFromUrl ?? reconnectInvite;
  const showInviteLanding = Boolean(activeInviteCode && !hasFamily && !selectedRecipeId);

  function handleInviteJoined() {
    setReconnectInvite(undefined);
    setDismissInvite(false);
    refreshFamilyState();
    setTab("home");
    router.replace("/");
  }

  return (
    <div className="app-shell flex min-h-screen flex-col text-kitchen-ink">
      <header className="sticky top-0 z-20 border-b-2 border-kitchen-border/80 bg-kitchen-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <AppLogo />
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-nord border-2 border-kitchen-border bg-kitchen-card px-3 py-1.5 text-xs text-kitchen-muted shadow-nord-sm"
            aria-label="テーマ切替"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        {hasFamily && familyName && (
          <p className="mt-2 text-xs font-medium text-kitchen-muted">
            {COPY.family.subtitle(familyName)}
          </p>
        )}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-4 py-4 pb-24">
        {familyBackup && tab === "home" && !showInviteLanding && (
          <FamilyReconnectBanner
            backup={familyBackup}
            onReconnect={() => {
              setReconnectInvite(familyBackup.inviteCode);
              setShowReconnectBanner(false);
            }}
            onDismiss={() => setShowReconnectBanner(false)}
          />
        )}
        {showInviteLanding && activeInviteCode ? (
          <FamilyInviteLanding
            inviteCode={activeInviteCode}
            onJoined={handleInviteJoined}
            onCreateFamily={() => {
              setDismissInvite(true);
              setReconnectInvite(undefined);
              setTab("family");
            }}
          />
        ) : selectedRecipeId ? (
          editingRecipeId === selectedRecipeId ? (
            <RecipeForm
              recipeId={selectedRecipeId}
              onSaved={() => {
                setEditingRecipeId(null);
                bumpRefresh();
              }}
              onCancel={() => setEditingRecipeId(null)}
            />
          ) : (
            <RecipeDetail
              recipeId={selectedRecipeId}
              onBack={() => {
                setSelectedRecipeId(null);
                setEditingRecipeId(null);
              }}
              onEdit={() => setEditingRecipeId(selectedRecipeId)}
              onCooked={bumpRefresh}
            />
          )
        ) : (
          <>
            {tab === "home" && (
              <section>
                {!hasFamily ? (
                  <p className="text-empty-hint text-left">{COPY.family.noFamily}</p>
                ) : (
                  <HomeDashboard
                    refreshKey={recipeRefresh}
                    onSelectRecipe={setSelectedRecipeId}
                    onRefresh={bumpRefresh}
                  />
                )}
              </section>
            )}
            {tab === "add" && (
              <section>
                <h2 className="section-title mb-1">思い出のレシピを残す</h2>
                <p className="text-empty-hint mb-5 text-left">
                  レシピは便利なメモであり、家族の時間をのこすアルバムでもあります。
                </p>
                <RecipeForm
                  onSaved={() => {
                    bumpRefresh();
                    setTab("home");
                  }}
                />
              </section>
            )}
            {tab === "family" && (
              <section>
                <h2 className="section-title mb-3">家族</h2>
                <FamilyPanel onFamilyReady={refreshFamilyState} />
              </section>
            )}
            {tab === "links" && (
              <section>
                {!hasFamily ? (
                  <p className="text-empty-hint text-left">{COPY.family.noFamily}</p>
                ) : (
                  <FamilyLinksPanel />
                )}
              </section>
            )}
          </>
        )}
      </main>

      {!selectedRecipeId && !showInviteLanding && <InstallHint />}

      {!selectedRecipeId && !showInviteLanding && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-kitchen-border bg-kitchen-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-md">
            <TabButton active={tab === "home"} onClick={() => setTab("home")} label="ホーム" />
            <TabButton active={tab === "add"} onClick={() => setTab("add")} label="追加" />
            <TabButton
              active={tab === "family"}
              onClick={() => setTab("family")}
              label="家族"
            />
            <TabButton
              active={tab === "links"}
              onClick={() => setTab("links")}
              label="リンク"
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-center text-xs font-bold transition ${
        active
          ? "border-t-[3px] border-kitchen bg-kitchen-cream/50 text-kitchen"
          : "border-t-[3px] border-transparent text-kitchen-muted"
      }`}
    >
      {label}
    </button>
  );
}
