import type { ReactNode } from "react";

// Floating glass bar at the top of the content area, over graphite.
export function TopNav({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <div className="glass-panel flex h-14 items-center justify-between gap-4 px-4">
        {children}
      </div>
    </header>
  );
}
