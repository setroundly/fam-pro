import { NextResponse } from "next/server";
import { getServerAdminSession } from "@/lib/adminSession";

export async function requireAdminSession() {
  const session = await getServerAdminSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}
