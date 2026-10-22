"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Usage } from "@/lib/api";
import type { Resource } from "@/lib/use-resource";

// The session (useAuth, the top nav badge) is read once per navigation, but
// the plan can change at any time: Stripe's webhook updates it on the API.
// When a page's fresh usage reports another plan, re-render the server
// layout, which re-reads GET /auth/me: the whole app then shows the plan the
// API holds. Never sets a plan itself.
export function useSessionPlanSync(usage: Resource<Usage>) {
  const { plan } = useAuth();
  const router = useRouter();
  const freshPlan = usage.status === "success" ? usage.data.plan : undefined;

  useEffect(() => {
    if (freshPlan && freshPlan !== plan) router.refresh();
  }, [freshPlan, plan, router]);
}
