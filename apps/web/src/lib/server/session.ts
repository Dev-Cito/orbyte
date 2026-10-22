import "server-only";
import type { Session } from "@/lib/api/types";
import { backendFetch, readSessionToken } from "./backend";

// Whether the request carries a session cookie, without asking the API if it
// is still valid: enough to choose between "Sign in" and "Go to app" on
// public pages (an expired one is caught by the app's own check).
export async function hasSessionCookie(): Promise<boolean> {
  return Boolean(await readSessionToken());
}

// The current session, validated by the API (GET /auth/me), or null when
// there is none or the API rejects the token (expired, forged, membership
// removed). The single place pages read "who is signed in".
export async function getSession(): Promise<Session | null> {
  if (!(await readSessionToken())) return null;
  const res = await backendFetch("/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`GET /auth/me failed with ${res.status}`);
  return (await res.json()) as Session;
}
