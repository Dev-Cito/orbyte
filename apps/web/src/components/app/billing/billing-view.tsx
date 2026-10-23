"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ErrorAlert } from "@/components/ui/alert";
import { billingApi, type PaidPlan } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";
import { useResource } from "@/lib/use-resource";
import { PlanBadge } from "../plan-badge";
import { UsageCard } from "../usage-card";
import { useSessionPlanSync } from "../use-session-plan-sync";
import { PlanCard, type PlanCardAction } from "./plan-card";
import { PLAN_OFFERS, PLAN_RANK } from "@/lib/plan-offers";

export function BillingView() {
  const { role, plan: sessionPlan } = useAuth();
  const usage = useResource("usage", billingApi.getUsage);
  useSessionPlanSync(usage);
  const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The plan as the API holds it (written by Stripe's webhook).
  const currentPlan = usage.status === "success" ? usage.data.plan : sessionPlan;
  // Display only: the API refuses checkout to members (403) on its own.
  const canManage = role === "owner" || role === "admin";

  async function upgrade(plan: PaidPlan) {
    setPendingPlan(plan);
    setError(null);
    try {
      const { url } = await billingApi.startCheckout(plan);
      // Stripe-hosted Checkout. The button stays busy until the page leaves.
      if (new URL(url).protocol !== "https:") throw new Error("Unexpected checkout URL");
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err));
      setPendingPlan(null);
    }
  }

  function actionFor(plan: (typeof PLAN_OFFERS)[number]["plan"]): PlanCardAction {
    if (plan === currentPlan) return { kind: "current" };
    if (PLAN_RANK[plan] < PLAN_RANK[currentPlan]) return { kind: "included" };
    if (!canManage) return { kind: "none" };
    return {
      kind: "upgrade",
      pending: pendingPlan === plan,
      disabled: pendingPlan !== null,
      onUpgrade: upgrade,
    };
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-fg-muted">Your plan and what it includes.</p>
        </div>
        <PlanBadge plan={currentPlan} />
      </header>

      <section aria-labelledby="usage-heading" className="flex flex-col gap-3">
        <h2 id="usage-heading" className="sr-only">
          Current usage
        </h2>
        <div className="max-w-md">
          <UsageCard usage={usage} />
        </div>
      </section>

      <section aria-labelledby="plans-heading" className="flex flex-col gap-4">
        <h2 id="plans-heading" className="text-lg font-semibold">
          Plans
        </h2>
        {!canManage && (
          <p
            role="note"
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg-secondary"
          >
            Only owners and admins can manage billing. Ask an owner of your organization to
            upgrade.
          </p>
        )}
        {error && <ErrorAlert>{error}</ErrorAlert>}
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_OFFERS.map((offer) => (
            <PlanCard key={offer.plan} offer={offer} action={actionFor(offer.plan)} />
          ))}
        </div>
        <p className="text-xs text-fg-muted">
          Payments are handled by Stripe. Prices in USD, billed monthly.
        </p>
      </section>
    </div>
  );
}
