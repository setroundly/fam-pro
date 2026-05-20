"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { MemoryWelcome } from "@/components/MemoryWelcome";
import { RecipeCard } from "@/components/RecipeCard";
import { FilterChip } from "@/components/RecipeMetaChips";
import { Field } from "@/components/ui/Field";
import { COPY } from "@/lib/copy";
import { apiErrorMessage, fetchJson } from "@/lib/fetchJson";
import {
  calendarGridDays,
  daysUntil,
  formatJaDate,
  monthKey,
} from "@/lib/dates";
import { RECIPE_CATEGORIES, getCategoryLabel } from "@/lib/recipeMeta";
import {
  getStoredDisplayName,
  getStoredFamilyId,
  getStoredUserId,
} from "@/lib/session";
import type { CookingLog, DashboardData, FamilyEvent, RecipeCategory } from "@/lib/types";

interface HomeDashboardProps {
  refreshKey: number;
  onSelectRecipe: (id: string) => void;
  onRefresh: () => void;
}

export function HomeDashboard({
  refreshKey,
  onSelectRecipe,
  onRefresh,
}: HomeDashboardProps) {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "all">("all");
  const [calendarMonth, setCalendarMonth] = useState(monthKey());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const recipeListRef = useRef<HTMLElement>(null);
  const pendingScrollRef = useRef(false);

  const [requestTitle, setRequestTitle] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function runSearch() {
    setAppliedSearch(searchInput.trim());
    pendingScrollRef.current = true;
  }

  function selectCategory(next: RecipeCategory | "all") {
    setCategory(next);
    if (next !== "all") {
      pendingScrollRef.current = true;
    }
  }

  const load = useCallback(async () => {
    const familyId = getStoredFamilyId();
    const userId = getStoredUserId();
    if (!familyId || !userId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      familyId,
      userId,
      month: calendarMonth,
    });
    if (appliedSearch) params.set("q", appliedSearch);
    if (category !== "all") params.set("category", category);

    try {
      const { res, data: dashboard } = await fetchJson<DashboardData & { error?: string }>(
        `/api/dashboard?${params}`
      );
      if (!res.ok) {
        throw new Error(apiErrorMessage(dashboard, "読み込みに失敗しました"));
      }
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [calendarMonth, category, appliedSearch]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (pendingScrollRef.current && data && !loading) {
      recipeListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingScrollRef.current = false;
    }
  }, [category, data, loading]);

  const logsByDay = useMemo(() => {
    const map = new Map<string, CookingLog[]>();
    if (!data?.cookingLogs) return map;
    for (const log of data.cookingLogs) {
      const list = map.get(log.cooked_on) ?? [];
      list.push(log);
      map.set(log.cooked_on, list);
    }
    return map;
  }, [data?.cookingLogs]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, FamilyEvent[]>();
    if (!data?.monthEvents) return map;
    for (const ev of data.monthEvents) {
      const list = map.get(ev.event_date) ?? [];
      list.push(ev);
      map.set(ev.event_date, list);
    }
    return map;
  }, [data?.monthEvents]);

  const dayLogs = selectedDay ? logsByDay.get(selectedDay) ?? [] : [];
  const dayEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    const familyId = getStoredFamilyId();
    if (!familyId || !requestTitle.trim()) return;
    setSubmitting(true);
    try {
      const { res, data: resBody } = await fetchJson<{ error?: string }>(
        "/api/recipe-requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyId,
            userId: getStoredUserId(),
            displayName: getStoredDisplayName(),
            title: requestTitle.trim(),
            note: requestNote.trim(),
          }),
        }
      );
      if (!res.ok) throw new Error(apiErrorMessage(resBody, "送信に失敗しました"));
      setRequestTitle("");
      setRequestNote("");
      onRefresh();
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    const familyId = getStoredFamilyId();
    if (!familyId || !eventTitle.trim() || !eventDate) return;
    setSubmitting(true);
    try {
      const { res, data: resBody } = await fetchJson<{ error?: string }>(
        "/api/family-events",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyId,
            userId: getStoredUserId(),
            displayName: getStoredDisplayName(),
            title: eventTitle.trim(),
            eventDate,
          }),
        }
      );
      if (!res.ok) throw new Error(apiErrorMessage(resBody, "登録に失敗しました"));
      const savedDate = eventDate;
      setEventTitle("");
      setEventDate("");
      setSelectedDay(savedDate);
      const savedMonth = savedDate.slice(0, 7);
      if (savedMonth !== calendarMonth) {
        setCalendarMonth(savedMonth);
      } else {
        void load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    } finally {
      setSubmitting(false);
    }
  }

  async function markRequestDone(id: string) {
    const { res, data: resBody } = await fetchJson<{ error?: string }>(
      `/api/recipe-requests/${id}`,
      { method: "PATCH" }
    );
    if (!res.ok) {
      setError(apiErrorMessage(resBody, "更新に失敗しました"));
      return;
    }
    void load();
  }

  async function deleteEvent(ev: FamilyEvent) {
    const familyId = getStoredFamilyId();
    if (!familyId) return;
    if (!confirm(`「${ev.title}」のしるしを削除しますか？`)) return;

    try {
      const { res, data: resBody } = await fetchJson<{ error?: string }>(
        `/api/family-events/${ev.id}?familyId=${familyId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(apiErrorMessage(resBody, "削除に失敗しました"));
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラー");
    }
  }

  if (loading && !data) {
    return <p className="text-empty-hint py-8">思い出を読み込み中…</p>;
  }

  if (!data) {
    return (
      <p className="text-empty-hint py-8">
        {error ?? "データを読み込めませんでした"}
      </p>
    );
  }

  const monthCooks = data.cookingLogs.length;
  const recipeCount = data.recipes.length + data.staleRecipes.length;
  const isFiltering = category !== "all" || appliedSearch.length > 0;
  const listTitle =
    category !== "all"
      ? `${getCategoryLabel(category)}のレシピ`
      : appliedSearch
        ? `「${appliedSearch}」の検索結果`
        : COPY.home.listTitle;
  const listHint =
    category !== "all"
      ? `${getCategoryLabel(category)}カテゴリのうちのレシピ一覧です。`
      : appliedSearch
        ? "検索に一致したレシピです。"
        : COPY.home.listHint;

  return (
    <div className="space-y-5 pb-4">
      <MemoryWelcome monthCooks={monthCooks} recipeCount={recipeCount} />

      <section>
        <Field label={COPY.home.searchLabel}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="flex gap-2"
          >
            <input
              className="input min-w-0 flex-1"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={COPY.home.searchPlaceholder}
            />
            <button type="submit" className="btn-primary shrink-0 px-4">
              検索
            </button>
          </form>
        </Field>
        {appliedSearch && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setAppliedSearch("");
            }}
            className="mt-2 text-xs font-bold text-kitchen hover:underline"
          >
            検索をクリア
          </button>
        )}
      </section>

      <section>
        <p className="mb-1 text-xs font-bold text-kitchen-muted">
          {COPY.home.categoryLabel}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip active={category === "all"} onClick={() => selectCategory("all")}>
            すべて
          </FilterChip>
          {RECIPE_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              active={category === cat.id}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </FilterChip>
          ))}
        </div>
      </section>

      {error && <p className="card-nord px-4 py-3 text-sm text-kitchen">{error}</p>}

      <Section
        ref={recipeListRef}
        title={`📖 ${listTitle}`}
        hint={listHint}
      >
        {loading ? (
          <p className="text-empty-hint text-left text-xs">読み込み中…</p>
        ) : data.recipes.length === 0 ? (
          <p className="text-empty-hint text-left text-xs">
            {isFiltering
              ? "条件に合うレシピがありません。"
              : "レシピがまだありません。「追加」タブから登録してみましょう。"}
          </p>
        ) : (
          <ul className="space-y-2">
            {data.recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} onClick={() => onSelectRecipe(recipe.id)} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {!isFiltering && (
        <>
      <Section title={`🍽 ${COPY.home.staleTitle}`} hint={COPY.home.staleHint}>
        {data.staleRecipes.length === 0 ? (
          <p className="text-empty-hint text-left text-xs">
            最近の食卓に並んだ料理ばかり。いいリズムです。
          </p>
        ) : (
          <ul className="space-y-2">
            {data.staleRecipes.slice(0, 8).map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} onClick={() => onSelectRecipe(recipe.id)} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`🗓 ${COPY.home.calendarTitle}`} hint={COPY.home.calendarHint}>
        <CalendarBlock
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          logsByDay={logsByDay}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          dayLogs={dayLogs}
          dayEvents={dayEvents}
          onSelectRecipe={onSelectRecipe}
          onDeleteEvent={deleteEvent}
        />
      </Section>

      <Section title={`📅 ${COPY.home.eventsTitle}`} hint={COPY.home.eventsHint}>
        {data.upcomingEvents.length === 0 ? (
          <p className="text-empty-hint text-left text-xs">
            30日以内の予定はまだありません。大切な日を登録しておきましょう。
          </p>
        ) : (
          <ul className="space-y-2">
            {data.upcomingEvents.map((ev) => {
              const d = daysUntil(ev.event_date);
              return (
                <li
                  key={ev.id}
                  className="card-nord flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-kitchen-ink">{ev.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-kitchen">
                      {d === 0 ? "今日" : d === 1 ? "明日" : `${d}日後`}（
                      {formatJaDate(ev.event_date)}）
                    </span>
                    <button
                      type="button"
                      onClick={() => void deleteEvent(ev)}
                      className="rounded border border-kitchen-border px-2 py-0.5 text-[10px] text-kitchen-muted hover:text-red-600"
                      aria-label={`${ev.title}を削除`}
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <form onSubmit={submitEvent} className="mt-3 space-y-2">
          <input
            className="input text-sm"
            placeholder="例: ママの誕生日"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <input
            className="input text-sm"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <button type="submit" disabled={submitting} className="btn-secondary w-full text-sm">
            しるしを追加
          </button>
        </form>
      </Section>

      <Section title={`✨ ${COPY.home.newTitle}`} hint={COPY.home.newHint}>
        {data.newRecipes.length === 0 ? (
          <p className="text-empty-hint text-left text-xs">
            家族が新しい味を届けると、ここに表示されます。
          </p>
        ) : (
          <ul className="space-y-2">
            {data.newRecipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  badge="NEW"
                  onClick={() => onSelectRecipe(recipe.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`💬 ${COPY.home.requestsTitle}`} hint={COPY.home.requestsHint}>
        <ul className="mb-3 space-y-2">
          {data.requests.map((req) => (
            <li key={req.id} className="card-nord px-3 py-2.5 text-sm">
              <p className="font-semibold text-kitchen-ink">{req.title}</p>
              <p className="text-xs text-kitchen-muted">{req.requester_name} より</p>
              {req.note && <p className="mt-1 text-xs text-kitchen-muted">{req.note}</p>}
              <button
                type="button"
                onClick={() => void markRequestDone(req.id)}
                className="mt-2 text-xs font-bold text-kitchen hover:underline"
              >
                食卓に並べた ✓
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={submitRequest} className="space-y-2">
          <input
            className="input text-sm"
            placeholder="食べたい料理（例: ハンバーグ）"
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
            required
          />
          <input
            className="input text-sm"
            placeholder="ひとこと（任意）"
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full text-sm">
            家族に届ける
          </button>
        </form>
      </Section>
        </>
      )}
    </div>
  );
}

function CalendarBlock({
  calendarMonth,
  setCalendarMonth,
  logsByDay,
  eventsByDay,
  selectedDay,
  setSelectedDay,
  dayLogs,
  dayEvents,
  onSelectRecipe,
  onDeleteEvent,
}: {
  calendarMonth: string;
  setCalendarMonth: (m: string) => void;
  logsByDay: Map<string, CookingLog[]>;
  eventsByDay: Map<string, FamilyEvent[]>;
  selectedDay: string | null;
  setSelectedDay: (d: string | null) => void;
  dayLogs: CookingLog[];
  dayEvents: FamilyEvent[];
  onSelectRecipe: (id: string) => void;
  onDeleteEvent: (ev: FamilyEvent) => void;
}) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary px-3 py-1 text-xs"
          onClick={() =>
            setCalendarMonth(monthKey(subMonths(parseISO(`${calendarMonth}-01`), 1)))
          }
        >
          ← 前月
        </button>
        <span className="font-display text-sm font-bold text-kitchen">
          {format(parseISO(`${calendarMonth}-01`), "yyyy年M月")}
        </span>
        <button
          type="button"
          className="btn-secondary px-3 py-1 text-xs"
          onClick={() =>
            setCalendarMonth(monthKey(addMonths(parseISO(`${calendarMonth}-01`), 1)))
          }
        >
          翌月 →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-kitchen-muted">
        {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarGridDays(calendarMonth).map((day, i) => {
          if (!day) return <span key={`empty-${i}`} className="min-h-9" />;
          const key = format(day, "yyyy-MM-dd");
          const cookCount = logsByDay.get(key)?.length ?? 0;
          const eventCount = eventsByDay.get(key)?.length ?? 0;
          const hasMark = cookCount > 0 || eventCount > 0;
          const active = selectedDay === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(active ? null : key)}
              className={`flex min-h-9 flex-col items-center justify-center rounded-lg border text-xs transition ${
                active
                  ? "border-kitchen bg-kitchen text-kitchen-cream"
                  : hasMark
                    ? "border-kitchen/50 bg-kitchen-sky/40 text-kitchen-ink"
                    : "border-transparent text-kitchen-muted"
              }`}
            >
              <span>{format(day, "d")}</span>
              {cookCount > 0 && (
                <span className="text-[9px] font-bold">{cookCount}品</span>
              )}
              {eventCount > 0 && (
                <span className="text-[9px] leading-none">
                  {cookCount > 0 ? "📅" : "📅 しるし"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <div className="mt-3 space-y-2 rounded-nord border border-kitchen-border bg-kitchen-cream/50 p-3">
          <p className="text-xs font-bold text-kitchen">{formatJaDate(selectedDay)}</p>
          {dayEvents.length > 0 && (
            <ul className="space-y-1.5">
              <p className="text-[10px] font-bold text-kitchen-muted">しるし</p>
              {dayEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-kitchen/30 bg-kitchen-card/80 px-2.5 py-1.5 text-sm font-semibold text-kitchen-ink"
                >
                  <span>📅 {ev.title}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(ev)}
                    className="shrink-0 rounded border border-kitchen-border px-1.5 py-0.5 text-[10px] font-normal text-kitchen-muted hover:text-red-600"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
          {dayLogs.length > 0 && (
            <ul className="space-y-1.5">
              <p className="text-[10px] font-bold text-kitchen-muted">食卓</p>
              {dayLogs.map((log) => (
                <li key={log.id}>
                  <button
                    type="button"
                    className="text-sm font-semibold text-kitchen hover:underline"
                    onClick={() => onSelectRecipe(log.recipe_id)}
                  >
                    {log.recipe_title}
                  </button>
                  <span className="ml-2 text-xs text-kitchen-muted">{log.cooked_by_name}</span>
                </li>
              ))}
            </ul>
          )}
          {dayEvents.length === 0 && dayLogs.length === 0 && (
            <p className="text-xs text-kitchen-muted">この日の記録はまだありません</p>
          )}
        </div>
      )}
    </>
  );
}

function Section({
  title,
  hint,
  children,
  ref,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}) {
  return (
    <section ref={ref} className="card-nord scroll-mt-24 space-y-3 p-4">
      <div>
        <h3 className="font-display text-sm font-bold text-kitchen">{title}</h3>
        {hint && (
          <p className="mt-1 text-[11px] leading-relaxed text-kitchen-muted">{hint}</p>
        )}
      </div>
      {children}
    </section>
  );
}
