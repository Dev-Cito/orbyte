import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { hasSessionCookie } from "@/lib/server/session";
import { Logo } from "./logo";

// Public top bar. Translucent over the light page where backdrop-filter is
// supported, opaque otherwise.
export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background supports-[backdrop-filter]:bg-background/75 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-fg-secondary">
            <li>
              <Link href="/#features" className="transition-colors duration-[180ms] hover:text-fg">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition-colors duration-[180ms] hover:text-fg">
                Pricing
              </Link>
            </li>
          </ul>
        </nav>
        {/* The page itself is static; only these buttons depend on the
            visitor, so only they wait for the request. */}
        <Suspense fallback={<SignedOutActions />}>
          <NavActions />
        </Suspense>
      </div>
    </header>
  );
}

// A session cookie is enough to offer "Go to app": an expired one is sent to
// /login by the app's own check. This never grants anything.
async function NavActions() {
  return (await hasSessionCookie()) ? <SignedInActions /> : <SignedOutActions />;
}

function SignedOutActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonClasses({ variant: "ghost", size: "sm", className: "h-9 px-3 text-sm" })}>
        Sign in
      </Link>
      <Link href="/register" className={buttonClasses({ size: "sm", className: "h-9 px-3.5 text-sm" })}>
        Get started
      </Link>
    </div>
  );
}

function SignedInActions() {
  return (
    <Link href="/app" className={buttonClasses({ size: "sm", className: "h-9 px-3.5 text-sm" })}>
      Go to app
    </Link>
  );
}
