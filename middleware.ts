import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestSessionEdge } from "@/lib/sessionEdge";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/admin/login",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  return false;
}

function isPublicApiGet(
  pathname: string,
  method: string,
  request: NextRequest
): boolean {
  if (method !== "GET") return false;
  if (pathname === "/api/tasks") {
    return !request.nextUrl.searchParams.has("userId");
  }
  if (pathname === "/api/confession") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && isPublicApiGet(pathname, request.method, request)) {
    return NextResponse.next();
  }

  const session = await getRequestSessionEdge(request);

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/app") || pathname.startsWith("/api/")) {
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    if (session.role !== "user" && pathname.startsWith("/app")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
