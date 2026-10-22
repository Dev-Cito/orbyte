import type { Plan } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABEL } from "./plan";

// The plan in words ("Free plan"), never just a color.
export function PlanBadge({ plan }: { plan: Plan }) {
  return <Badge>{PLAN_LABEL[plan]}</Badge>;
}
