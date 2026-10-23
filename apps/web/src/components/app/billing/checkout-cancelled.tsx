import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export function CheckoutCancelled() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-panel border border-border bg-surface px-6 py-12 text-center">
      <h1 className="text-xl font-semibold">Checkout cancelled</h1>
      <p className="text-sm text-fg-secondary">No charge was made. Your plan is unchanged.</p>
      <Link
        href="/app/billing"
        className={buttonClasses({ variant: "secondary", className: "mt-2" })}
      >
        Back to billing
      </Link>
    </div>
  );
}
