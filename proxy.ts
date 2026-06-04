import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

import { verifyToken } from "@/lib/auth/session";

const SESSION_COOKIE = "session";
const ADMIN_SESSION_COOKIE = "admin_session";
const PROTECTED_PREFIXES = ["/dash"];
const ADMIN_PREFIXES = ["/admin"];
const PUBLIC_AUTH_PATHS = new Set(["/auth"]);
const LOGIN_PATH = "/auth";
const ADMIN_LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/dash";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in .env.local");
  }
  return secret;
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      role: string;
    };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

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

  if (isAdminPath(pathname) && pathname !== ADMIN_LOGIN_PATH) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAdmin = verifyAdminToken(adminToken);
    if (!isAdmin) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (adminToken) {
        response.cookies.delete(ADMIN_SESSION_COOKIE);
      }
      return response;
    }
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyToken(sessionToken);
  const isAuthenticated = session !== null;

  if (pathname === ADMIN_LOGIN_PATH) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (verifyAdminToken(adminToken)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

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
