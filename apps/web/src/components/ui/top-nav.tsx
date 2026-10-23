import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";

// The app's top bar: white, hairline bottom border, the Orbyte wordmark on
// the left (the "O" mark alone on small screens), then the page-level
// contents (organization, plan, user). Lightly frosted where supported.
export function TopNav({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-surface supports-[backdrop-filter]:bg-surface/85 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6">
        {/* The switch sits on wrappers: the logos set their own display. */}
        <span className="hidden sm:flex">
          <Logo href="/app" height={28} />
        </span>
        <span className="flex sm:hidden">
          <LogoMark href="/app" size={26} />
        </span>
        {children && (
          <>
            <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4">{children}</div>
          </>
        )}
      </div>
    </header>
  );
}
