import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Shared rhythm of the marketing pages: a full-width band, centered content.
export function Section({
  id,
  tone = "light",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: "light" | "subtle" | "dark";
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-16",
        tone === "light" && "bg-background text-fg",
        tone === "subtle" && "bg-surface-subtle text-fg",
        tone === "dark" && "bg-surface-dark text-fg-inverse",
      )}
    >
      <div className={cn("mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28", className)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.12em]",
        // Secondary, not muted: muted grey is 4.39:1 on the subtle band.
        tone === "light" ? "text-fg-secondary" : "text-fg-inverse/60",
      )}
    >
      {children}
    </p>
  );
}
