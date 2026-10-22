import "server-only";
import type { NextRequest } from "next/server";

// Defense in depth against CSRF on cookie-authenticated routes, on top of
// SameSite=Lax: a state-changing request must come from this app's own pages.
export function rejectCrossSite(request: NextRequest): Response | null {
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const crossSite =
    (fetchSite !== null && fetchSite !== "same-origin") ||
    (origin !== null && origin !== request.nextUrl.origin);
  return crossSite
    ? Response.json({ statusCode: 403, message: "Cross-site request refused" }, { status: 403 })
    : null;
}
