import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// A small label. The text carries the meaning; color only supports it.
// Neutral on purpose: lime is kept for actions.
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-fg-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
