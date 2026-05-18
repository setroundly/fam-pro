"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  mapRowToFailure,
  mergeFailure,
  sortFailuresNewest,
} from "@/lib/failures";
import {
  getSupabaseBrowser,
  isSupabaseBrowserConfigured,
} from "@/lib/supabaseBrowser";
import type { Failure } from "@/lib/types";

const CLIENT_FAIL_INTERVAL_MS = 60_000;

async function processOverdueClient() {
  try {
    await fetch("/api/tasks/fail-overdue", { method: "POST" });
  } catch {
    // 失敗してもタイムライン表示は続行
  }
}

export function useFailuresTimeline() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);

  const markNew = useCallback((id: string) => {
    setNewIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2400);
  }, []);

  const fetchFailures = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const { res, data } = await fetchJson<{
        error?: string;
        failures?: Failure[];
      }>("/api/failures");

      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "タイムラインの読み込みに失敗しました"));
      }

      if (mountedRef.current) {
        setFailures(sortFailuresNewest(data.failures ?? []));
      }
    } catch (e) {
      if (mountedRef.current && !opts?.silent) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    } finally {
      if (mountedRef.current && !opts?.silent) {
        setLoading(false);
      }
    }
  }, []);

  const prependFailure = useCallback(
    (failure: Failure) => {
      setFailures((prev) => mergeFailure(prev, failure));
      markNew(failure.id);
    },
    [markNew]
  );

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      await processOverdueClient();
      await fetchFailures();
    };

    void bootstrap();

    const overdueTimer = window.setInterval(
      () => void processOverdueClient().then(() => fetchFailures({ silent: true })),
      CLIENT_FAIL_INTERVAL_MS
    );

    const supabase = getSupabaseBrowser();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null =
      null;

    if (supabase && isSupabaseBrowserConfigured()) {
      channel = supabase
        .channel("failures-timeline-live")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "failures" },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            const failure = mapRowToFailure(row);
            setFailures((prev) => mergeFailure(prev, failure));
            markNew(failure.id);
          }
        )
        .subscribe();
    }

    return () => {
      mountedRef.current = false;
      window.clearInterval(overdueTimer);
      if (supabase && channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [fetchFailures, markNew]);

  return {
    failures,
    loading,
    error,
    newIds,
    refresh: fetchFailures,
    prependFailure,
  };
}
