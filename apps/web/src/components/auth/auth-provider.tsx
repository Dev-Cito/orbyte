"use client";

import { createContext, use, type ReactNode } from "react";
import type { Organization, Plan, Role, Session, User } from "@/lib/api/types";

export interface AuthState {
  user: User;
  organization: Organization;
  role: Role;
  plan: Plan;
}

const AuthContext = createContext<AuthState | null>(null);

// Holds the session validated by the API (GET /auth/me) for the app's client
// components. For DISPLAY only (names, plan badge, role label): every
// permission is enforced by the API on each request.
export function AuthProvider({ session, children }: { session: Session; children: ReactNode }) {
  const value: AuthState = { ...session, plan: session.organization.plan };
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const auth = use(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside the /app layout");
  return auth;
}
