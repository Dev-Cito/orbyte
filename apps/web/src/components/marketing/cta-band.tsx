import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { OrbyteCube } from "./cube/orbyte-cube";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="overflow-hidden bg-surface-dark text-fg-inverse">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-20 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 md:py-16">
        <div className="flex flex-col items-start gap-8">
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
        {/* Its own column: never behind the heading or the buttons. Above
            the heading, small and still, on mobile. */}
        <OrbyteCube className="order-first size-24 md:order-none md:size-72 lg:size-80" />
      </div>
    </section>
  );
}
