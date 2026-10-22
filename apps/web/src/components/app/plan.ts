import type { Plan, Usage } from "@/lib/api";

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free plan",
  pro: "Pro plan",
  business: "Business plan",
};

// Where the upgrade flow will live (billing pages, next iteration).
export const UPGRADE_HREF = "/app/billing";

// Display comfort only (disable a button, show a notice): the API checks the
// limit again on every creation and has the final word.
export function isAtProjectLimit(usage: Usage | undefined): boolean {
  const max = usage?.limits.maxProjects;
  return max != null && usage!.usage.projects >= max;
}
