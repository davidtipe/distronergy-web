import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password"];

const ROLE_ROUTES: Record<string, string> = {
  "/customer": "CUSTOMER",
  "/supplier": "SUPPLIER",
  "/admin": "ADMIN",
  "/driver": "DRIVER",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie (refresh token indicates an active session)
  const hasSession = request.cookies.has("refresh_token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection is enforced client-side via useRequireAuth
  // since we can't decode the JWT in edge middleware without the secret.
  // The middleware here only ensures a session cookie exists.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
