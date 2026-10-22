import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// An error message announced to screen readers, with a visible label so the
// meaning never depends on color.
export function ErrorAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2 rounded-xl border border-danger/30 bg-danger-tint px-3.5 py-3 text-sm text-danger",
        className,
      )}
    >
      <span aria-hidden="true" className="font-bold">
        !
      </span>
      <p>
        <span className="font-semibold">Error: </span>
        {children}
      </p>
    </div>
  );
}
