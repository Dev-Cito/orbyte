import Link from "next/link";
import type { Project } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export function ProjectCard({ project, onDelete }: { project: Project; onDelete: () => void }) {
  return (
    <article className="group relative flex flex-col gap-6 rounded-card border border-border bg-surface p-5 transition-colors duration-[180ms] hover:border-fg-disabled">
      <div>
        <h2 className="truncate text-base font-semibold">
          {/* The whole card is the link target, via the stretched ::after. */}
          <Link
            href={`/app/projects/${project.id}`}
            className="after:absolute after:inset-0 after:rounded-card"
          >
            {project.name}
          </Link>
        </h2>
        <p className="mt-1 text-xs text-fg-muted">Created {formatDate(project.createdAt)}</p>
      </div>
      <div className="relative z-10 flex justify-end">
        <Button
          variant="ghost"
         
          size="sm"
          onClick={onDelete}
          aria-label={`Delete project ${project.name}`}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
