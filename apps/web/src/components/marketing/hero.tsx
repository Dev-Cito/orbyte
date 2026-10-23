import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ProductMock } from "./product-preview";

// The landing's single opening section: the promise, the actions, and the
// product right under them, on one continuous graphite background.
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-surface-dark text-fg-inverse">
      {/* A faint light behind the headline, so the dark reads as depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--text-inverse)_7%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-fg-inverse/75">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Projects, tasks and plans for multi-team organizations
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-[40px] font-[700] leading-[1.04] tracking-[-0.03em] sm:text-[56px] lg:text-[72px]"
          >
            Project management for teams that ship.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-inverse/75 sm:text-xl">
            One calm workspace for every project: boards that move work from to-do to done, a
            dashboard that shows where your plan stands, and each team&apos;s data kept strictly to
            itself.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/register" className={buttonClasses({ tone: "dark", className: "h-12 px-6 text-base" })}>
              Get started free
            </Link>
            <Link
              href="#features"
              className={buttonClasses({ variant: "ghost", tone: "dark", className: "h-12 px-4 text-base" })}
            >
              See how it works
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-fg-inverse/60">Free plan, no credit card required.</p>
        </div>

        <div className="mt-16 sm:mt-20">
          <ProductMock />
        </div>
      </div>
    </section>
  );
}
