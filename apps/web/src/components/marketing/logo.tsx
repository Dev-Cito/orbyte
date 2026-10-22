import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-lg font-semibold tracking-tight",
        tone === "light" ? "text-fg" : "text-fg-inverse",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-6 rounded-lg", tone === "light" ? "bg-brand" : "bg-accent")} />
      Orbyte
    </Link>
  );
}
