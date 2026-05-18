import type { Failure } from "@/lib/types";

export function mapRowToFailure(row: Record<string, unknown>): Failure {
  return {
    id: String(row.id),
    created_at: String(row.created_at),
    title: String(row.title),
    description: String(row.description),
    donation_amount: Number(row.donation_amount),
    user_name: String(row.user_name),
    task_id: row.task_id ? String(row.task_id) : null,
    user_id: row.user_id ? String(row.user_id) : null,
    donation_destination: row.donation_destination
      ? String(row.donation_destination)
      : null,
    donate_url: row.donate_url ? String(row.donate_url) : null,
  };
}

/** SNS風の見出し（例: 太郎さんが失敗しました） */
export function failureHeadline(failure: Failure): string {
  const name = failure.user_name.trim() || "匿名";
  return `${name}さんが失敗しました`;
}

/** サブコピー（例: 500円寄付しました） */
export function failureDonationLine(failure: Failure): string {
  const amount = failure.donation_amount.toLocaleString("ja-JP");
  if (failure.donation_destination) {
    return `${amount}円を「${failure.donation_destination}」へ寄付`;
  }
  return `${amount}円寄付しました`;
}

export function sortFailuresNewest(items: Failure[]): Failure[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function mergeFailure(
  current: Failure[],
  incoming: Failure
): Failure[] {
  if (current.some((f) => f.id === incoming.id)) return current;
  return sortFailuresNewest([incoming, ...current]);
}
