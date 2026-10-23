import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PaidPlan } from "@/lib/api";
import type { PlanOffer } from "@/lib/plan-offers";

export type PlanCardAction =
  | { kind: "current" }
  | { kind: "included" }
  | { kind: "upgrade"; pending: boolean; disabled: boolean; onUpgrade: (plan: PaidPlan) => void }
  // A higher plan the viewer may not purchase (members).
  | { kind: "none" };

export function PlanCard({ offer, action }: { offer: PlanOffer; action: PlanCardAction }) {
  const current = action.kind === "current";
  return (
    <article
      aria-labelledby={`plan-${offer.plan}`}
      className={cn(
        "flex flex-col gap-5 rounded-card border bg-surface p-6",
        // Highlighted by a graphite outline AND the "Current plan" label.
        current ? "border-brand ring-1 ring-brand" : "border-border",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`plan-${offer.plan}`} className="text-lg font-semibold">
            {offer.name}
          </h3>
          <p className="mt-0.5 text-sm text-fg-muted">{offer.tagline}</p>
        </div>
        {current && (
          <Badge className="border-brand text-fg">
            <span aria-hidden="true">✓</span> Current plan
          </Badge>
        )}
      </header>

      <p>
        <span className="text-3xl font-semibold tracking-tight">{offer.price}</span>
        <span className="text-sm text-fg-muted">
          <span aria-hidden="true">/mo</span>
          <span className="sr-only"> per month</span>
        </span>
      </p>

      <ul className="flex flex-1 flex-col gap-2 text-sm text-fg-secondary">
        {offer.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="text-fg-muted">
              —
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="min-h-11">
        {action.kind === "upgrade" && offer.plan !== "free" && (
          <Button
           
            fullWidth
            loading={action.pending}
            disabled={action.disabled}
            onClick={() => action.onUpgrade(offer.plan as PaidPlan)}
          >
            Upgrade to {offer.name}
          </Button>
        )}
        {action.kind === "current" && (
          <p className="flex h-11 items-center text-sm text-fg-secondary">This is your plan.</p>
        )}
        {action.kind === "included" && (
          <p className="flex h-11 items-center text-sm text-fg-muted">Included in your plan.</p>
        )}
      </div>
    </article>
  );
}
