import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Optimistic check only: no session cookie, no app. Whether the token is
// still valid is decided by the API, through GET /auth/me in the app layout
// (SessionGate). Proxy must stay fast and never be the authorization layer.
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = new URL("/login", request.nextUrl.origin);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
