"use client";

import { useState } from "react";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  USER_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
} from "@/lib/constants";
import { datetimeLocalJstToUtcIso, defaultDeadlineJstParts } from "@/lib/datetime";
import type { DonationDestinationId } from "@/lib/donationDestinations";
import type { Task } from "@/lib/types";
import { DeadlinePicker } from "./DeadlinePicker";
import { DonationDestinationPicker } from "./DonationDestinationPicker";
import { Field } from "./ui/Field";

interface TaskFormProps {
  onCreated?: (payload: { userId: string; displayName: string; task: Task }) => void;
}

const defaultDeadline = (() => {
  const { date, time } = defaultDeadlineJstParts();
  return `${date}T${time}`;
})();

export function TaskForm({ onCreated }: TaskFormProps) {
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "";
  });
  const [title, setTitle] = useState("");
  const [deadlineAt, setDeadlineAt] = useState(defaultDeadline);
  const [penaltyAmount, setPenaltyAmount] = useState("1000");
  const [selectedDonationId, setSelectedDonationId] =
    useState<DonationDestinationId | null>(null);
  const [donationDestination, setDonationDestination] = useState("");
  const [donateUrl, setDonateUrl] = useState("");
  const [customDonationName, setCustomDonationName] = useState("");
  const [customDonateUrl, setCustomDonateUrl] = useState("");
  const [notifyName, setNotifyName] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDonationId) {
      setError("寄付先を選択してください");
      return;
    }

    const finalName =
      selectedDonationId === "other"
        ? customDonationName.trim()
        : donationDestination.trim();
    const finalUrl =
      selectedDonationId === "other"
        ? customDonateUrl.trim()
        : donateUrl.trim();

    if (!finalName) {
      setError("寄付先名を入力してください");
      return;
    }
    if (selectedDonationId === "other" && !finalUrl) {
      setError("寄付ページのURLを入力してください");
      return;
    }

    setSubmitting(true);

    const userId =
      typeof window !== "undefined"
        ? localStorage.getItem(USER_STORAGE_KEY) ?? undefined
        : undefined;

    let deadlineIso: string;
    try {
      deadlineIso = datetimeLocalJstToUtcIso(deadlineAt);
    } catch {
      setError("締切の日時が正しくありません");
      setSubmitting(false);
      return;
    }

    try {
      const { res, data } = await fetchJson<{
        error?: string;
        user?: { id: string; display_name: string };
        task?: Task;
      }>("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          displayName: displayName.trim(),
          title: title.trim(),
          deadlineAt: deadlineIso,
          penaltyAmount: Number(penaltyAmount),
          donationDestination: finalName,
          donateUrl: finalUrl || undefined,
          notifyName: notifyName.trim(),
          notifyEmail: notifyEmail.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(apiErrorMessage(data, "作成に失敗しました"));
      }

      if (!data.user || !data.task) {
        throw new Error("作成に失敗しました");
      }

      localStorage.setItem(USER_STORAGE_KEY, data.user.id);
      localStorage.setItem(USER_NAME_STORAGE_KEY, data.user.display_name);

      setTitle("");
      setDeadlineAt(defaultDeadline);
      setPenaltyAmount("1000");
      setSelectedDonationId(null);
      setDonationDestination("");
      setDonateUrl("");
      setCustomDonationName("");
      setCustomDonateUrl("");
      setNotifyName("");
      setNotifyEmail("");

      onCreated?.({
        userId: data.user.id,
        displayName: data.user.display_name,
        task: data.task,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="あなたの名前" required>
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="名前"
          required
          maxLength={32}
        />
      </Field>

      <Field
        label="公開タスク"
        hint="3キロ痩せる など具体的に"
        required
      >
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
        />
      </Field>

      <DeadlinePicker value={deadlineAt} onChange={setDeadlineAt} />

      <Field label="覚悟の金額（円）" required>
        <input
          type="number"
          inputMode="numeric"
          className="input tabular-nums"
          value={penaltyAmount}
          onChange={(e) => setPenaltyAmount(e.target.value)}
          min={1}
          required
        />
      </Field>

      <DonationDestinationPicker
        selectedId={selectedDonationId}
        customName={customDonationName}
        customUrl={customDonateUrl}
        onSelect={(option) => {
          setSelectedDonationId(option.id);
          if (option.id === "other") {
            setDonationDestination("");
            setDonateUrl("");
          } else {
            setDonationDestination(option.name);
            setDonateUrl(option.url);
            setCustomDonationName("");
            setCustomDonateUrl("");
          }
        }}
        onCustomNameChange={setCustomDonationName}
        onCustomUrlChange={setCustomDonateUrl}
      />

      <div className="rounded-2xl border border-fail-border/60 bg-zinc-950/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          見届け人
        </p>
        <div className="flex flex-col gap-4">
          <Field label="名前" required>
            <input
              className="input"
              value={notifyName}
              onChange={(e) => setNotifyName(e.target.value)}
              placeholder="上司"
              required
            />
          </Field>
          <Field label="メール" required>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className="input"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="friend@example.com"
              required
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-fail/30 bg-fail/10 px-3 py-2 text-sm text-fail">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl bg-gradient-to-r from-fail to-fail-muted py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(255,77,77,0.35)] transition hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? "設定中…" : "タスクを設定"}
      </button>
    </form>
  );
}
