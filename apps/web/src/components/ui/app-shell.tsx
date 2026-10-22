import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { NavList, SidebarNav, type NavItem } from "./sidebar-nav";

export type { NavItem };

// The application frame: a solid graphite sidebar and a graphite content
// area. No glass here: glass is for what floats above (TopNav, modals).
export function AppShell({
  nav,
  topNav,
  children,
}: {
  nav: NavItem[];
  topNav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-dark text-fg-inverse">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-fg-on-lime"
      >
        Skip to content
      </a>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-brand px-4 py-6 md:flex">
        <Link href="/app" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold tracking-tight">
          <span aria-hidden="true" className="size-6 rounded-lg bg-accent" />
          Orbyte
        </Link>
        <Suspense fallback={<NavList items={nav} pathname={null} />}>
          <SidebarNav items={nav} />
        </Suspense>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {topNav}
        <div className="px-4 pt-3 md:hidden">
          <Suspense fallback={<NavList items={nav} pathname={null} orientation="horizontal" />}>
            <SidebarNav items={nav} orientation="horizontal" />
          </Suspense>
        </div>
        <main id="main" className="flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
