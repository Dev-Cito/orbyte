import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-surface-dark text-fg-inverse">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="cta-title" className="text-3xl font-[700] tracking-[-0.02em] sm:text-4xl">
            Your first three projects are on us.
          </h2>
          <p className="mt-3 text-lg text-fg-inverse/70">Create your organization in under a minute.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/register" className={buttonClasses({ tone: "dark", className: "h-12 px-6 text-base" })}>
            Get started free
          </Link>
          <Link
            href="/login"
            className={buttonClasses({ variant: "ghost", tone: "dark", className: "h-12 px-4 text-base" })}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
