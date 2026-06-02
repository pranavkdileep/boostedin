import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth/session";

const SESSION_COOKIE = "session";
const PROTECTED_PREFIXES = ["/dash"];
const PUBLIC_AUTH_PATHS = new Set(["/auth"]);
const LOGIN_PATH = "/auth";
const DASHBOARD_PATH = "/dash";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return DASHBOARD_PATH;
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DASHBOARD_PATH;
  }
  return value;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyToken(sessionToken);
  const isAuthenticated = session !== null;

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (sessionToken) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  if (PUBLIC_AUTH_PATHS.has(pathname) && isAuthenticated) {
    const intended = safeRedirectPath(
      request.nextUrl.searchParams.get("redirect")
    );
    return NextResponse.redirect(new URL(intended, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
