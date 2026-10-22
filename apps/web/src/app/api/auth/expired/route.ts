import type { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/server/backend";
import { safeNextPath } from "@/lib/safe-next-path";

// Where the app layout sends a session the API rejected: a page cannot delete
// a cookie while rendering, a Route Handler can. Drops it, then back to login.
export async function GET(request: NextRequest) {
  await clearSessionCookie();
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const login = new URL("/login", request.nextUrl.origin);
  login.searchParams.set("expired", "1");
  if (next) login.searchParams.set("next", next);
  return Response.redirect(login, 303);
}
