"use client";

import { useState } from "react";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import { USER_NAME_STORAGE_KEY } from "@/lib/constants";
import type { Failure } from "@/lib/types";
import { Field } from "./ui/Field";

interface FailurePostFormProps {
  onPosted: (failure: Failure) => void;
}

export function FailurePostForm({ onPosted }: FailurePostFormProps) {
  const [userName, setUserName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "";
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [donationAmount, setDonationAmount] = useState("500");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setJustPosted(false);

    const name = userName.trim() || "匿名";

    try {
      const { res, data } = await fetchJson<{
        error?: string;
        failure?: Failure;
      }>("/api/failures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          donationAmount: Number(donationAmount),
          userName: name,
        }),
      });

      if (!res.ok || !data.failure) {
        throw new Error(apiErrorMessage(data, "投稿に失敗しました"));
      }

      localStorage.setItem(USER_NAME_STORAGE_KEY, name);
      setTitle("");
      setDescription("");
      setDonationAmount("500");
      setJustPosted(true);
      window.setTimeout(() => setJustPosted(false), 2000);
      onPosted(data.failure);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mb-6 rounded-2xl border bg-fail-card/90 p-4 transition-all duration-500 ${
        justPosted
          ? "border-fail shadow-[0_0_24px_rgba(255,77,77,0.35)] scale-[1.01]"
          : "border-fail-border/80"
      }`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        失敗を投稿
      </p>

      <div className="flex flex-col gap-3">
        <Field label="名前（空欄で匿名）">
          <input
            className="input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="名前"
            maxLength={32}
          />
        </Field>

        <Field label="失敗したこと" required>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="3キロ痩せる"
            required
            maxLength={120}
          />
        </Field>

        <Field label="詳細・言い訳" required>
          <textarea
            className="input min-h-[72px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="締切に間に合わなかった…"
            required
            maxLength={500}
          />
        </Field>

        <Field label="覚悟の金額（円）" required>
          <input
            type="number"
            inputMode="numeric"
            className="input tabular-nums"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            min={1}
            required
          />
        </Field>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-fail/30 bg-fail/10 px-3 py-2 text-sm text-fail">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-xl bg-fail py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? "投稿中…" : "失敗を投稿する"}
      </button>
    </form>
  );
}
