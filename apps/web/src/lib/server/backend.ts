import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Server-side access to the Orbyte API. This is where the bearer token is
// attached: it is read from the httpOnly cookie, so browser code never
// handles it.

function apiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url.replace(/\/+$/, "");
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Calls the API. With auth (the default), adds "Authorization: Bearer" from
// the session cookie. Throws BackendUnreachableError if the API is down.
export async function backendFetch(
  path: string,
  init: { method?: string; body?: string; auth?: boolean; search?: string } = {},
): Promise<Response> {
  const { method = "GET", body, auth = true, search = "" } = init;
  const headers: Record<string, string> = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) {
    const token = await readSessionToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }
  try {
    return await fetch(`${apiBaseUrl()}${path}${search}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    throw new BackendUnreachableError();
  }
}

export class BackendUnreachableError extends Error {
  constructor() {
    super("The API is unreachable");
  }
}

// Route Handlers / Server Functions only (cookies cannot be written while a
// page renders).
export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    // Lax: sent on top-level navigations (so links into the app work), never
    // on cross-site POST/fetch, which is the CSRF vector.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Expires with the JWT, so a dead token does not linger.
    maxAge: secondsUntilExpiry(token),
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

// Reads "exp" from the JWT payload to size the cookie. Not a verification:
// the API verifies the signature on every call.
function secondsUntilExpiry(token: string): number {
  const fallback = 60 * 60;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp !== "number") return fallback;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}
