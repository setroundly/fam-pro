import { APP_NAME } from "@/lib/branding";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendFailureEmail(params: {
  to: string;
  displayName: string;
  taskTitle: string;
  penaltyAmount: number;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.warn("[resend] Skipping email: RESEND_API_KEY or EMAIL_FROM not set");
    return { skipped: true as const };
  }

  const { to, displayName, taskTitle, penaltyAmount } = params;
  const text = `${displayName}さんがタスク『${taskTitle}』に失敗しました。\n寄付予定額：${penaltyAmount}円`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `【${APP_NAME}】${displayName}さんがタスクに失敗しました`,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { skipped: false as const, id: data?.id };
}
