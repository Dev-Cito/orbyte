import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PLAN_OFFERS } from "@/lib/plan-offers";
import { Eyebrow, Section } from "./section";

export function PricingPreview() {
  return (
    <Section tone="subtle" labelledBy="pricing-preview-title">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <Eyebrow>Pricing</Eyebrow>
          <h2 id="pricing-preview-title" className="mt-3 text-3xl font-[700] tracking-[-0.02em] sm:text-5xl">
            Start free. Upgrade when you grow.
          </h2>
        </div>
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-base font-semibold text-fg underline-offset-4 hover:underline">
          Compare plans
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {PLAN_OFFERS.map((offer) => (
          <li key={offer.plan} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-6">
            <h3 className="text-base font-semibold">{offer.name}</h3>
            <p>
              <span className="text-3xl font-[700] tracking-tight">{offer.price}</span>
              <span className="text-sm text-fg-muted">
                <span aria-hidden="true">/mo</span>
                <span className="sr-only"> per month</span>
              </span>
            </p>
            <p className="text-sm text-fg-secondary">{offer.features[0]}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
