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
      className="h-2 w-full overflow-hidden rounded-full bg-white/10"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[180ms]",
          emphasis ? "bg-[#fbbf24]" : "bg-fg-inverse/70",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
