import type { ReactNode } from "react";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

// Public pages (light, editorial). Not matched by proxy.ts, which only
// guards /app: no session is needed to read them.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-fg-on-lime"
      >
        Skip to content
      </a>
      <MarketingNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
