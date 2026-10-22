import { Suspense } from "react";
import { SessionSummary } from "@/components/app/session-summary";
import { SessionGate } from "@/components/auth/session-gate";
import { AppShell, type NavItem } from "@/components/ui/app-shell";
import { TopNav } from "@/components/ui/top-nav";

const NAV: NavItem[] = [{ href: "/app", label: "Dashboard" }];

// Every /app page renders behind SessionGate: the API must accept the
// session token (GET /auth/me) first. proxy.ts already sent visitors without
// a session cookie to /login.
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense fallback={<AppShellLoading />}>
      <SessionGate>
        <AppShell
          nav={NAV}
          topNav={
            <TopNav>
              <SessionSummary />
            </TopNav>
          }
        >
          {children}
        </AppShell>
      </SessionGate>
    </Suspense>
  );
}

function AppShellLoading() {
  return (
    <AppShell nav={NAV}>
      <p role="status" className="text-sm text-fg-inverse/70">
        Loading your workspace…
      </p>
    </AppShell>
  );
}
