import Link from "next/link";
import { Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PLAN_OFFERS } from "@/lib/plan-offers";

const FEATURED = "pro";

// Public, light version of the in-app plan grid (same plans, same limits,
// from lib/plan-offers). Every CTA leads to sign-up: subscribing happens
// later, inside the app, for a given organization. No checkout from here.
export function PricingCards() {
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-5 md:grid-cols-3">
        {PLAN_OFFERS.map((offer) => {
          const featured = offer.plan === FEATURED;
          return (
            <li
              key={offer.plan}
              aria-labelledby={`price-${offer.plan}`}
              className={cn(
                "relative flex flex-col gap-6 rounded-panel border bg-surface p-7",
                featured ? "border-brand border-2 shadow-[0_20px_50px_rgba(17,24,39,0.10)]" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id={`price-${offer.plan}`} className="text-xl font-semibold tracking-tight">
                    {offer.name}
                  </h2>
                  <p className="mt-1 text-sm text-fg-secondary">{offer.tagline}</p>
                </div>
                {featured && (
                  <span className="whitespace-nowrap rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-fg-inverse">
                    Most popular
                  </span>
                )}
              </div>
              <p>
                <span className="text-5xl font-[700] tracking-[-0.03em]">{offer.price}</span>
                <span className="text-base text-fg-muted">
                  <span aria-hidden="true">/mo</span>
                  <span className="sr-only"> per month</span>
                </span>
              </p>
              <ul className="flex flex-1 flex-col gap-3 text-[15px] text-fg-secondary">
                {offer.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg" strokeWidth={2.25} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                aria-label={`Get started with ${offer.name}`}
                className={buttonClasses({
                  // Lime only on the featured plan's CTA.
                  variant: featured ? "primary" : "secondary",
                  className: "h-12 w-full text-base",
                })}
              >
                Get started
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-fg-secondary">
        Every organization starts on Free. Upgrade to Pro or Business from the Billing page once
        you&apos;re in; payments are handled by Stripe. Prices in USD, billed monthly.
      </p>
    </div>
  );
}
