import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Tone = "light" | "dark";
type Size = "md" | "sm";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold " +
  "transition-[background-color,border-color,color,opacity] duration-[180ms] ease-out " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

const sizes: Record<Size, string> = {
  md: "h-11 rounded-xl px-4 text-sm",
  sm: "h-8 rounded-lg px-2.5 text-xs",
};

// Lime is reserved for the primary action: one per view, ideally. On light
// surfaces its edge is drawn in --accent-strong: vivid lime alone is 1.5:1
// against white, too faint to outline a control.
const variants: Record<Variant, Record<Tone, string>> = {
  primary: {
    light: "bg-accent text-fg-on-lime border border-accent-strong hover:bg-accent-hover",
    dark: "bg-accent text-fg-on-lime hover:bg-accent-hover",
  },
  secondary: {
    light: "bg-surface text-fg border border-border shadow-subtle hover:bg-surface-subtle",
    dark: "bg-surface-dark-raised text-fg-inverse border border-white/10 hover:bg-white/10",
  },
  ghost: {
    light: "text-fg-secondary hover:bg-surface-subtle hover:text-fg",
    dark: "text-fg-inverse/80 hover:bg-white/10 hover:text-fg-inverse",
  },
  // Destructive confirmations only.
  danger: {
    light: "bg-danger text-white hover:bg-danger-hover",
    dark: "bg-danger text-white hover:bg-danger-hover",
  },
};

// The button look, for links styled as buttons (e.g. an "Upgrade" link).
export function buttonClasses({
  variant = "primary",
  tone = "light",
  size = "md",
  className,
}: { variant?: Variant; tone?: Tone; size?: Size; className?: string } = {}): string {
  return cn(base, sizes[size], variants[variant][tone], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  // The surface the button sits on.
  tone?: Tone;
  size?: Size;
  // Disables the button and announces the pending state.
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  tone = "light",
  size = "md",
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
      className={buttonClasses({
        variant,
        tone,
        size,
        className: cn(fullWidth && "w-full", className),
      })}
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
