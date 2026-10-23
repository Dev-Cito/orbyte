import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// A solid white surface with a hairline border (shadows barely there).
// Floating surfaces use .glass-surface instead.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-border bg-surface p-6 text-fg shadow-subtle", className)}
      {...props}
    />
  );
}
