import type { NextRequest } from "next/server";
import { unreachable } from "@/lib/server/authenticate";
import {
  backendFetch,
  BackendUnreachableError,
  clearSessionCookie,
} from "@/lib/server/backend";
import { rejectCrossSite } from "@/lib/server/same-origin";

// Authenticated pass-through to the API: /api/backend/<path> -> {API}/<path>,
// with "Authorization: Bearer <token>" taken from the httpOnly cookie. Only
// the method, the query string and a JSON body are forwarded, never the
// browser's own headers or cookies.
//
// The API stays the only authority: this adds a credential, it does not
// decide anything.

// Never through here: login/register would hand the token to the browser
// (they have their own handlers), and webhooks are Stripe's, not the user's.
function isForbiddenPath(path: string): boolean {
  return /^(auth\/(?!me$)|webhooks\/)/.test(path);
}

async function forward(
  request: NextRequest,
  ctx: RouteContext<"/api/backend/[...path]">,
): Promise<Response> {
  if (request.method !== "GET") {
    const refused = rejectCrossSite(request);
    if (refused) return refused;
  }
  const { path: segments } = await ctx.params;
  const path = segments.map(encodeURIComponent).join("/");
  if (isForbiddenPath(path)) {
    return Response.json({ statusCode: 404, message: "Not found" }, { status: 404 });
  }

  let res: Response;
  try {
    res = await backendFetch(`/${path}`, {
      method: request.method,
      body: request.method === "GET" ? undefined : (await request.text()) || undefined,
      search: request.nextUrl.search,
    });
  } catch (err) {
    if (err instanceof BackendUnreachableError) return unreachable();
    throw err;
  }

  // The API no longer accepts this token: forget it, so the next page load
  // goes straight to /login.
  if (res.status === 401) await clearSessionCookie();

  return new Response(res.status === 204 ? null : await res.arrayBuffer(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
