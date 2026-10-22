import { toApiError, UnauthorizedError } from "./errors";
import type { ApiErrorBody } from "./types";

// Browser-side API client. It only ever calls this app's own /api/* routes
// (same origin): the session token lives in an httpOnly cookie that
// JavaScript cannot read, and the Next.js server adds the
// "Authorization: Bearer" header when it forwards the call to the API.

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  // false for calls where a 401 is an expected answer (wrong password), not
  // an expired session.
  redirectOnUnauthorized?: boolean;
}

// Calls the API through the authenticated proxy: apiRequest("/projects")
// reaches GET {API}/projects with the session's bearer token.
export function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(`/api/backend${path}`, options);
}

// Low-level: a same-origin route of this app (used for /api/auth/*).
export async function request<T>(
  url: string,
  { method = "GET", body, redirectOnUnauthorized = true }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw toApiError(0, { message: "Network error. Check your connection and try again." });
  }

  if (res.ok) {
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const errorBody = (await res.json().catch(() => null)) as ApiErrorBody | null;
  if (res.status === 401 && redirectOnUnauthorized) {
    // The server already dropped the cookie: back to the login page,
    // remembering where the user was. A full page load on purpose (this is
    // not a component, and it discards all client state of the dead session).
    const next = window.location.pathname + window.location.search;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?expired=1&next=${encodeURIComponent(next)}`);
    throw new UnauthorizedError();
  }
  throw toApiError(res.status, errorBody);
}
