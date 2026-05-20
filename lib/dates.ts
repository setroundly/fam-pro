import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { ja } from "date-fns/locale";

export const STALE_DAYS = 30;
export const EVENT_ALERT_DAYS = 30;

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function monthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function formatJaDate(iso: string): string {
  return format(parseISO(iso), "M月d日(E)", { locale: ja });
}

export function daysUntil(isoDate: string): number {
  return differenceInCalendarDays(parseISO(isoDate), new Date());
}

export function isStaleLastCooked(lastCookedOn: string | null | undefined): boolean {
  if (!lastCookedOn) return true;
  const days = differenceInCalendarDays(new Date(), parseISO(lastCookedOn));
  return days >= STALE_DAYS;
}

export function isUpcomingEvent(eventDate: string): boolean {
  const days = daysUntil(eventDate);
  return days >= 0 && days <= EVENT_ALERT_DAYS;
}

export function calendarDaysForMonth(month: string): Date[] {
  const base = parseISO(`${month}-01`);
  return eachDayOfInterval({
    start: startOfMonth(base),
    end: endOfMonth(base),
  });
}

/** 日曜始まりのカレンダー用（月初の空白は null） */
export function calendarGridDays(month: string): (Date | null)[] {
  const days = calendarDaysForMonth(month);
  const leading = Array(days[0].getDay()).fill(null) as null[];
  return [...leading, ...days];
}

export function matchesSearch(recipe: {
  title: string;
  description: string;
  tags: string[];
  ingredients: string[];
}, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    recipe.title,
    recipe.description,
    ...recipe.tags,
    ...recipe.ingredients,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export { isSameMonth, addDays, format, parseISO };
