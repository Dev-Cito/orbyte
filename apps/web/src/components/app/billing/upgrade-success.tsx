"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { billingApi, UnauthorizedError, type PaidPlan } from "@/lib/api";
import { PLAN_LABEL } from "../plan";

// Stripe sent the browser back, but the plan only changes when Stripe's
// webhook reaches the API, asynchronously: maybe already, maybe in a few
// seconds. So this page never assumes "back from checkout = upgraded". It
// polls the plan the API holds, and only reports it once the API has it.
const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 12; // ~18 seconds

type SyncState =
  | { status: "waiting" }
  | { status: "upgraded"; plan: PaidPlan }
  // Not seen in time: the webhook is slow, the payment is not in question.
  | { status: "slow" };

export function UpgradeSuccess() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>({ status: "waiting" });
  const [round, setRound] = useState(0);

  const upgraded = useEffectEvent((plan: PaidPlan) => {
    setState({ status: "upgraded", plan });
    // Re-render the server layout: GET /auth/me again, so useAuth() and the
    // top nav show the new plan without a reload.
    router.refresh();
  });
  const gaveUp = useEffectEvent(() => setState({ status: "slow" }));

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // One request at a time: the next one is scheduled after the previous
    // answer, never on a fixed interval that could pile requests up.
    async function attempt(n: number) {
      try {
        const usage = await billingApi.getUsage();
        if (cancelled) return;
        if (usage.plan !== "free") return upgraded(usage.plan);
      } catch (err) {
        // Signed out: the client is already redirecting to /login.
        if (cancelled || err instanceof UnauthorizedError) return;
        // Anything else (network blip, 5xx): keep trying until the deadline.
      }
      if (n + 1 >= MAX_ATTEMPTS) return gaveUp();
      timer = setTimeout(() => void attempt(n + 1), POLL_INTERVAL_MS);
    }

    void attempt(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [round]);

  function checkAgain() {
    setState({ status: "waiting" });
    setRound((r) => r + 1);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-panel border border-white/10 bg-surface-dark-raised px-6 py-12 text-center">
      {/* Announces each state change to screen readers. */}
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
        {state.status === "waiting" && (
          <>
            <span
              aria-hidden="true"
              className="size-8 animate-spin rounded-full border-2 border-fg-inverse/20 border-t-fg-inverse"
            />
            <h1 className="text-xl font-semibold">Finalizing your upgrade…</h1>
            <p className="text-sm text-fg-inverse/70">
              Confirming your subscription with Stripe. This usually takes a few seconds.
            </p>
          </>
        )}
        {state.status === "upgraded" && (
          <>
            <h1 className="text-xl font-semibold">
              You&apos;re now on the {PLAN_LABEL[state.plan]} <span aria-hidden="true">🎉</span>
            </h1>
            <p className="text-sm text-fg-inverse/70">
              Unlimited projects are unlocked for your whole organization.
            </p>
          </>
        )}
        {state.status === "slow" && (
          <>
            <h1 className="text-xl font-semibold">Your payment went through</h1>
            <p className="text-sm text-fg-inverse/70">
              Your plan will update shortly — refresh in a moment. There is no need to pay again.
            </p>
          </>
        )}
      </div>

      {state.status === "upgraded" && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/app" className={buttonClasses({ tone: "dark" })}>
            Go to dashboard
          </Link>
          <Link href="/app/projects" className={buttonClasses({ variant: "secondary", tone: "dark" })}>
            View projects
          </Link>
        </div>
      )}
      {state.status === "slow" && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" tone="dark" onClick={checkAgain}>
            Check again
          </Button>
          <Link href="/app" className={buttonClasses({ variant: "ghost", tone: "dark" })}>
            Go to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
