import { cn } from "@/lib/cn";

// Placeholder block while content loads (static under reduced motion: the
// global rule stops the pulse).
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-surface-subtle", className)} />;
}
