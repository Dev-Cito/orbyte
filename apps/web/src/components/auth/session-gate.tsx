import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { AuthProvider } from "./auth-provider";

// Validates the session with the API before rendering the app. A missing,
// expired or revoked token goes to /api/auth/expired, which drops the cookie
// and redirects to /login. Render it inside a <Suspense> boundary: it reads
// the request's cookies.
export async function SessionGate({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/api/auth/expired");
  return <AuthProvider session={session}>{children}</AuthProvider>;
}
