import type { Task, TaskStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL } from "./status";

export interface Move {
  to: TaskStatus;
  // Short visible text ("Start →"); the accessible name spells out the
  // target column.
  label: string;
}

export function TaskCard({
  task,
  moves,
  busy,
  onMove,
  onDelete,
}: {
  task: Task;
  moves: Move[];
  busy: boolean;
  onMove: (to: TaskStatus) => void;
  onDelete: () => void;
}) {
  return (
    <article
      aria-busy={busy || undefined}
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-surface-dark-raised p-3"
    >
      <h3 className="text-sm font-medium break-words">{task.title}</h3>
      <div className="flex flex-wrap items-center gap-1">
        {moves.map((move) => (
          <Button
            key={move.to}
            variant="secondary"
            tone="dark"
            size="sm"
            disabled={busy}
            onClick={() => onMove(move.to)}
            aria-label={`Move "${task.title}" to ${STATUS_LABEL[move.to]}`}
          >
            {move.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          tone="dark"
          size="sm"
          disabled={busy}
          onClick={onDelete}
          aria-label={`Delete task "${task.title}"`}
          className="ml-auto"
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
