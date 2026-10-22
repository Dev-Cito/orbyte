import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { UPGRADE_HREF } from "./plan";

// "You've reached your plan limit" + the Upgrade action (the lime CTA).
// Shown when usage says the limit is reached, and when the API refuses a
// creation with PLAN_LIMIT_REACHED.
export function PlanLimitNotice({
  title = "You've reached your plan limit",
  children,
  role,
  className,
}: {
  title?: string;
  children: ReactNode;
  // "alert" when it answers a refused action; omitted for a passive notice.
  role?: "alert";
  className?: string;
}) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col gap-3 rounded-card border border-[#fbbf24]/30 bg-surface-dark-raised p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-0.5 font-bold text-[#fbbf24]">
          !
        </span>
        <div>
          <p className="text-sm font-semibold text-fg-inverse">{title}</p>
          <p className="mt-0.5 text-sm text-fg-inverse/70">{children}</p>
        </div>
      </div>
      <Link href={UPGRADE_HREF} className={buttonClasses({ tone: "dark", className: "shrink-0" })}>
        Upgrade
      </Link>
    </div>
  );
}
