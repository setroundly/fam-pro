import { NextResponse } from "next/server";
import { getServerAdminSession } from "@/lib/adminSession";

export async function GET() {
  const session = await getServerAdminSession();
  return NextResponse.json({ admin: Boolean(session) });
}
