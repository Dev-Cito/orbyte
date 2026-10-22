import type { Plan } from "@/lib/api";

// Display copy for the plan grid. Marketing text only: Stripe holds the real
// prices, and the API enforces what each plan allows.
export interface PlanOffer {
  plan: Plan;
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

export const PLAN_OFFERS: PlanOffer[] = [
  {
    plan: "free",
    name: "Free",
    price: "$0",
    tagline: "To get started.",
    features: ["Up to 3 projects", "Unlimited tasks", "Kanban boards"],
  },
  {
    plan: "pro",
    name: "Pro",
    price: "$29",
    tagline: "For growing teams.",
    features: ["Unlimited projects", "Everything in Free", "Priority email support"],
  },
  {
    plan: "business",
    name: "Business",
    price: "$99",
    tagline: "For organizations at scale.",
    features: ["Everything in Pro", "Dedicated onboarding", "Premium support"],
  },
];

// Ordering, to tell an upgrade from a lower plan.
export const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, business: 2 };
