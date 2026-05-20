import type { Metadata } from "next";
import { APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `家族のレシピ帳に参加 | ${APP_NAME}`,
  description: "招待リンクから、名前だけ入力して家族のレシピ帳に参加できます。",
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
