"use client";

import { useCallback, useEffect, useState } from "react";
import { formatJstDateTime } from "@/lib/datetime";
import { apiErrorMessage, fetchJson, parseJsonResponse } from "@/lib/fetchJson";
import { USER_STORAGE_KEY } from "@/lib/constants";
import type { Task } from "@/lib/types";

export function MyTasks({ refreshKey }: { refreshKey?: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);

  const fetchTasks = useCallback(async () => {
    const userId = localStorage.getItem(USER_STORAGE_KEY);
    setHasUser(!!userId);

    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { res, data } = await fetchJson<{ tasks?: Task[] }>(
        `/api/tasks?userId=${userId}`
      );
      if (!res.ok) throw new Error(apiErrorMessage(data, "読み込みに失敗しました"));
      setTasks(data.tasks ?? []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  const completeTask = async (taskId: string) => {
    const userId = localStorage.getItem(USER_STORAGE_KEY);
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      fetchTasks();
      return;
    }
    const data = await parseJsonResponse<{ error?: string }>(res);
    alert(apiErrorMessage(data, "完了できませんでした"));
  };

  if (loading) {
    return <p className="text-empty-hint py-8">読み込み中…</p>;
  }

  if (!hasUser) {
    return (
      <p className="text-empty-hint py-12">
        タスクを1つ作成すると、ここに表示されます。
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-empty-hint py-12">タスクがありません。</p>
    );
  }

  const statusLabel: Record<Task["status"], string> = {
    pending: "進行中",
    completed: "完了",
    failed: "失敗",
  };

  const statusColor: Record<Task["status"], string> = {
    pending: "text-amber-400",
    completed: "text-emerald-400",
    failed: "text-fail",
  };

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-xl border border-fail-border bg-fail-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-normal leading-snug text-zinc-100">
              {task.title}
            </h3>
            <span className={`text-xs font-bold ${statusColor[task.status]}`}>
              {statusLabel[task.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            <span className="tabular-nums">
              締切 {formatJstDateTime(task.deadline_at)} JST
            </span>
            {" · "}
            {task.penalty_amount.toLocaleString()}円 → {task.donation_destination}
          </p>
          {task.status === "pending" && (
            <button
              type="button"
              onClick={() => completeTask(task.id)}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white"
            >
              完了した（逃げ切る）
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
