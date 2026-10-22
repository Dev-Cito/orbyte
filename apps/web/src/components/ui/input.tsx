import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  // dark: on graphite surfaces and in glass dialogs.
  tone?: "light" | "dark";
}

// Always labelled; hint and error are wired to the input for screen readers.
export function Input({
  label,
  hint,
  error,
  tone = "light",
  id,
  className,
  ...props
}: InputProps) {
  const dark = tone === "dark";
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={cn("text-sm font-medium", dark ? "text-fg-inverse" : "text-fg")}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        className={cn(
          "h-11 rounded-xl border px-3.5 text-sm transition-colors duration-[180ms]",
          dark
            ? "bg-surface-dark-raised text-fg-inverse placeholder:text-fg-inverse/40 disabled:opacity-60"
            : "bg-surface text-fg placeholder:text-fg-disabled disabled:bg-surface-subtle disabled:text-fg-disabled",
          error
            ? dark
              ? "border-[#f87171]"
              : "border-danger"
            : dark
              ? "border-white/15 hover:border-white/30"
              : "border-border hover:border-fg-disabled",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className={cn("text-xs", dark ? "text-fg-inverse/60" : "text-fg-muted")}>
          {hint}
        </p>
      )}
      {error && (
        // Text plus an explicit "Error:" prefix: not color alone.
        <p
          id={errorId}
          className={cn("text-xs font-medium", dark ? "text-[#fca5a5]" : "text-danger")}
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}
