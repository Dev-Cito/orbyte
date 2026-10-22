"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { PlanBadge } from "./plan-badge";

// Target of every "Upgrade" link until the billing pages land.
export function BillingPlaceholder() {
  const { plan } = useAuth();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <PlanBadge plan={plan} />
      </header>
      <Card tone="dark">
        <p className="font-semibold">Plans and upgrades — coming next</p>
        <p className="mt-1 text-sm text-fg-inverse/70">
          Upgrading to Pro or Business (unlimited projects) will be available here shortly.
        </p>
      </Card>
    </div>
  );
}
