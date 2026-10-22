import type { Metadata } from "next";
import { UpgradeSuccess } from "@/components/app/billing/upgrade-success";

export const metadata: Metadata = { title: "Upgrade" };

// Reached from Stripe Checkout through /billing/success (see next.config.ts).
export default function UpgradeSuccessPage() {
  return <UpgradeSuccess />;
}
