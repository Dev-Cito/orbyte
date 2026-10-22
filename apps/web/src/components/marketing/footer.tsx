import Link from "next/link";
import { Logo } from "./logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-fg-secondary">
            Projects and tasks for teams, with each organization&apos;s data kept to itself.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-fg-secondary">
            <li>
              <Link href="/#features" className="hover:text-fg">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-fg">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-fg">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-fg">
                Get started
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-fg-muted sm:px-8">
          © <CurrentYear /> Orbyte. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Resolved at build time (and on revalidation), not on every request.
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}
