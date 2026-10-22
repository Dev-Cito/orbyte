import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "light" | "dark";

const tones: Record<Tone, string> = {
  light: "bg-surface border border-border text-fg shadow-sm",
  dark: "bg-surface-dark-raised border border-white/10 text-fg-inverse",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  // light: on #F9FAFB pages; dark: inside the graphite app shell.
  tone?: Tone;
}

// A solid surface. Floating surfaces use .glass-panel instead.
export function Card({ tone = "light", className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-card p-6", tones[tone], className)} {...props} />
  );
}
