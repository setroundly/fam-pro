"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultDeadlineJstParts,
  formatJstDateTime,
  jstDateAndTimeToUtcIso,
} from "@/lib/datetime";
import { Field } from "./ui/Field";

interface DeadlinePickerProps {
  value: string;
  onChange: (datetimeLocalJst: string) => void;
}

function parseValue(value: string) {
  if (!value) return defaultDeadlineJstParts();
  const [date, time] = value.split("T");
  return { date: date ?? "", time: time ?? "23:59" };
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const initial = parseValue(value);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);

  useEffect(() => {
    const parsed = parseValue(value);
    setDate(parsed.date);
    setTime(parsed.time);
  }, [value]);

  const previewIso = useMemo(() => {
    if (!date || !time) return null;
    try {
      return jstDateAndTimeToUtcIso(date, time);
    } catch {
      return null;
    }
  }, [date, time]);

  const emit = (nextDate: string, nextTime: string) => {
    if (!nextDate || !nextTime) return;
    onChange(`${nextDate}T${nextTime}`);
  };

  return (
    <Field label="締切" hint="日本時間（JST）で設定" required>
      <div className="rounded-2xl border border-fail-border/80 bg-zinc-950/80 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              日付
            </span>
            <input
              type="date"
              className="input input-datetime w-full"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                emit(e.target.value, time);
              }}
              required
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              時刻
            </span>
            <input
              type="time"
              className="input input-datetime w-full"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                emit(date, e.target.value);
              }}
              required
            />
          </div>
        </div>

        {previewIso && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-fail/10 px-3 py-2 text-sm text-zinc-200">
            <span className="text-fail">●</span>
            <span>
              <span className="text-zinc-500">締切:</span>{" "}
              <time dateTime={previewIso} className="font-semibold tabular-nums">
                {formatJstDateTime(previewIso)}
              </time>
              <span className="ml-1 text-xs text-zinc-500">JST</span>
            </span>
          </p>
        )}
      </div>
    </Field>
  );
}
