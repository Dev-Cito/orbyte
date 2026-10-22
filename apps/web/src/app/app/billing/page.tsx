import type { Metadata } from "next";
import { BillingPlaceholder } from "@/components/app/billing-placeholder";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return <BillingPlaceholder />;
}
