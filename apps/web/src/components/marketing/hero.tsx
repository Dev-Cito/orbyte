import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-background">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-secondary">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          Projects, tasks and plans for multi-team organizations
        </p>
        <h1
          id="hero-title"
          className="mt-6 max-w-4xl text-[40px] font-[700] leading-[1.04] tracking-[-0.03em] text-fg sm:text-[56px] lg:text-[72px]"
        >
          Project management for teams that ship.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-secondary sm:text-xl">
          Orbyte gives every organization its own workspace: projects, task boards and plans
          that grow with you, with each team&apos;s data kept strictly to itself.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/register" className={buttonClasses({ className: "h-12 px-6 text-base" })}>
            Get started free
          </Link>
          <Link
            href="#product"
            className={buttonClasses({ variant: "ghost", className: "h-12 px-4 text-base text-fg" })}
          >
            See how it works
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-fg-muted">Free plan, no credit card required.</p>
      </div>
    </section>
  );
}
