import Link from "next/link";
import type { ReactNode } from "react";

// Light pages (#F9FAFB) for signing in and up: the graphite app starts after.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-fg">
          <span aria-hidden="true" className="size-6 rounded-lg bg-brand" />
          Orbyte
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
