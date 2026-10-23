import { Suspense, type ReactNode } from "react";
import { NavList, SidebarNav, type NavItem } from "./sidebar-nav";

export type { NavItem };

// The application frame, light: a full-width top bar (topNav), then a white
// sidebar with a hairline border next to the content, on a barely tinted
// canvas. Mobile: the sidebar becomes a row of tabs under the top bar.
export function AppShell({
  nav,
  topNav,
  children,
}: {
  nav: NavItem[];
  topNav: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-fg-on-lime"
      >
        Skip to content
      </a>
      {topNav}
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-surface px-3 py-6 md:block">
          <Suspense fallback={<NavList items={nav} pathname={null} />}>
            <SidebarNav items={nav} />
          </Suspense>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border bg-surface px-4 md:hidden">
            <Suspense fallback={<NavList items={nav} pathname={null} orientation="horizontal" />}>
              <SidebarNav items={nav} orientation="horizontal" />
            </Suspense>
          </div>
          <main id="main" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
