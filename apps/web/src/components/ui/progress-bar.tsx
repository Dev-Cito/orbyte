import { cn } from "@/lib/cn";

// A labelled progress bar. Callers show the numbers as text next to it too:
// the bar alone never carries the information.
export function ProgressBar({
  value,
  max,
  label,
  emphasis = false,
}: {
  value: number;
  max: number;
  label: string;
  // Draws attention (e.g. at a limit). Pair it with a text explanation.
  emphasis?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-2 w-full overflow-hidden rounded-full bg-border"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[180ms]",
          // Both fills stay above 3:1 against the track (WCAG 1.4.11).
          emphasis ? "bg-accent-deep" : "bg-brand",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
