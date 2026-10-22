import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// An error message announced to screen readers, with a visible label so the
// meaning never depends on color.
export function ErrorAlert({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  // dark: on the graphite app shell and in glass dialogs.
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2 rounded-xl border px-3.5 py-3 text-sm",
        tone === "light"
          ? "border-danger/30 bg-danger-tint text-danger"
          : "border-[#f87171]/40 bg-[#450a0a]/60 text-[#fecaca]",
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
