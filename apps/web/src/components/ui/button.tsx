import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Tone = "light" | "dark";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-semibold " +
  "transition-[background-color,border-color,color,opacity] duration-[180ms] ease-out " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Lime is reserved for the primary action: one per view, ideally.
const variants: Record<Variant, Record<Tone, string>> = {
  primary: {
    light: "bg-accent text-fg-on-lime hover:bg-[#bef264]",
    dark: "bg-accent text-fg-on-lime hover:bg-[#bef264]",
  },
  secondary: {
    light: "bg-surface text-fg border border-border hover:bg-surface-subtle",
    dark: "bg-surface-dark-raised text-fg-inverse border border-white/10 hover:bg-white/10",
  },
  ghost: {
    light: "text-fg-secondary hover:bg-surface-subtle hover:text-fg",
    dark: "text-fg-inverse/80 hover:bg-white/10 hover:text-fg-inverse",
  },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  // The surface the button sits on.
  tone?: Tone;
  // Disables the button and announces the pending state.
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  tone = "light",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant][tone], fullWidth && "w-full", className)}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
