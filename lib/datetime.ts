export const JST_TIMEZONE = "Asia/Tokyo";

/** UTC ISO → 2026/05/18 21:45（日本時間・24時間） */
export function formatJstDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  const parts = getJstParts(d);
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}

/** UTC ISO → 2026年5月18日 21:45 */
export function formatJstDateTimeLong(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("ja-JP", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** UTC ISO → 21:45（当日タイムライン用） */
export function formatJstTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  const { hour, minute } = getJstParts(d);
  return `${hour}:${minute}`;
}

/** `<input type="datetime-local">` の値を日本時間として解釈し UTC ISO に変換 */
export function datetimeLocalJstToUtcIso(localValue: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localValue);
  if (!match) {
    throw new Error("Invalid datetime");
  }

  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const h = Number(match[4]);
  const mi = Number(match[5]);
  const utcMs = Date.UTC(y, mo - 1, d, h - 9, mi, 0, 0);
  return new Date(utcMs).toISOString();
}

/** UTC ISO → datetime-local 用（日本時間） */
export function utcIsoToDatetimeLocalJst(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const { year, month, day, hour, minute } = getJstParts(d);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** 日付・時刻を分けた入力用 */
export function jstDateAndTimeToUtcIso(date: string, time: string): string {
  return datetimeLocalJstToUtcIso(`${date}T${time}`);
}

export function utcIsoToJstDateAndTime(iso: string): {
  date: string;
  time: string;
} {
  const local = utcIsoToDatetimeLocalJst(iso);
  const [date, time] = local.split("T");
  return { date: date ?? "", time: time ?? "" };
}

/** デフォルト締切: 明日 23:59 JST */
export function defaultDeadlineJstParts(): { date: string; time: string } {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const { year, month, day } = getJstParts(tomorrow);
  return { date: `${year}-${month}-${day}`, time: "23:59" };
}

function getJstParts(d: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(d).map((p) => [p.type, p.value])
  );

  return {
    year: parts.year ?? "0000",
    month: parts.month ?? "01",
    day: parts.day ?? "01",
    hour: parts.hour ?? "00",
    minute: parts.minute ?? "00",
  };
}
