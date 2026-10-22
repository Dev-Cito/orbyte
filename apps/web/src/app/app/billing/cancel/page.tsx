import type { Metadata } from "next";
import { CheckoutCancelled } from "@/components/app/billing/checkout-cancelled";

export const metadata: Metadata = { title: "Checkout cancelled" };

// Reached from Stripe Checkout through /billing/cancel (see next.config.ts).
export default function CheckoutCancelledPage() {
  return <CheckoutCancelled />;
}
