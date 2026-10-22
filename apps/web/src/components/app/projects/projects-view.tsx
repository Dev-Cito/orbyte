"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, billingApi, projectsApi, type Project } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";
import { useResource } from "@/lib/use-resource";
import { LoadError } from "../load-error";
import { isAtProjectLimit } from "../plan";
import { PlanLimitNotice } from "../plan-limit-notice";
import { useSessionPlanSync } from "../use-session-plan-sync";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectCard } from "./project-card";

export function ProjectsView() {
  const projects = useResource("projects", projectsApi.list);
  const usage = useResource("usage", billingApi.getUsage);
  useSessionPlanSync(usage);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Comfort only: the API refuses over-limit creations on its own.
  const atLimit = usage.status === "success" && isAtProjectLimit(usage.data);

  function refresh() {
    projects.reload();
    usage.reload();
  }

  function cancelDelete() {
    setToDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await projectsApi.remove(toDelete.id);
      cancelDelete();
      refresh();
    } catch (err) {
      // Already gone (deleted elsewhere): same outcome, just refresh.
      if (err instanceof ApiError && err.status === 404) {
        cancelDelete();
        refresh();
      } else {
        setDeleteError(errorMessage(err));
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          {projects.status === "success" && (
            <p className="mt-1 text-sm text-fg-inverse/60">
              {projects.data.length} {projects.data.length === 1 ? "project" : "projects"}
              {usage.status === "success" && usage.data.limits.maxProjects !== null
                ? ` of ${usage.data.limits.maxProjects} on your plan`
                : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          {/* At the limit it drops the lime: Upgrade is the action then. */}
          <Button
            tone="dark"
            variant={atLimit ? "secondary" : "primary"}
            onClick={() => setCreating(true)}
            disabled={atLimit}
            aria-describedby={atLimit ? "new-project-hint" : undefined}
          >
            New project
          </Button>
          {atLimit && (
            <p id="new-project-hint" className="text-xs text-fg-inverse/70">
              Upgrade to add more projects.
            </p>
          )}
        </div>
      </header>

      {atLimit && usage.status === "success" && (
        <PlanLimitNotice>
          Your plan includes {usage.data.limits.maxProjects} projects. Delete one or upgrade to
          create more.
        </PlanLimitNotice>
      )}

      {projects.status === "loading" && (
        <ul role="status" aria-label="Loading projects" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Skeleton className="h-32 rounded-card" />
            </li>
          ))}
        </ul>
      )}
      {projects.status === "error" && <LoadError error={projects.error} onRetry={projects.reload} />}
      {projects.status === "success" &&
        (projects.data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="text-base font-semibold">No projects yet — create your first one</p>
            <p className="text-sm text-fg-inverse/60">
              Projects hold your team&apos;s tasks, from to-do to done.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} onDelete={() => setToDelete(project)} />
              </li>
            ))}
          </ul>
        ))}

      <CreateProjectDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={refresh}
        onLimitReached={refresh}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this project?"
        description={
          <>
            <strong className="text-fg-inverse">{toDelete?.name}</strong> and all of its tasks will be
            permanently deleted.
          </>
        }
        confirmLabel="Delete project"
        pending={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
