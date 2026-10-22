"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ErrorAlert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, projectsApi, tasksApi, type Task, type TaskStatus } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/format";
import { useResource } from "@/lib/use-resource";
import { LoadError } from "../load-error";
import { STATUS_LABEL } from "./status";
import { TaskCard, type Move } from "./task-card";

// Columns are named in text (the status is never shown by color alone).
const COLUMNS: { status: TaskStatus; moves: Move[] }[] = [
  { status: "todo", moves: [{ to: "in_progress", label: "Start →" }] },
  {
    status: "in_progress",
    moves: [
      { to: "todo", label: "← To do" },
      { to: "done", label: "Done →" },
    ],
  },
  { status: "done", moves: [{ to: "in_progress", label: "← Reopen" }] },
];

export function ProjectBoard({ projectId }: { projectId: string }) {
  const project = useResource(`project:${projectId}`, () => projectsApi.get(projectId));
  const tasks = useResource(`tasks:${projectId}`, () => tasksApi.listByProject(projectId));
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (project.status === "error") {
    // 404: missing, or another organization's (the API does not tell them
    // apart, on purpose). 400: not even a valid id.
    if (project.error instanceof ApiError && [400, 404].includes(project.error.status)) {
      return <ProjectNotFound />;
    }
    return (
      <div className="mx-auto max-w-5xl">
        <LoadError error={project.error} onRetry={project.reload} />
      </div>
    );
  }

  async function runTaskAction(taskId: string, action: () => Promise<unknown>) {
    setBusyTaskId(taskId);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      // Re-read either way: on failure too, the server state is the truth.
      tasks.reload();
      setBusyTaskId(null);
    }
  }

  function moveTask(task: Task, to: TaskStatus) {
    // Lands at the bottom of the target column.
    const inTarget = tasks.data?.filter((t) => t.status === to) ?? [];
    const position = inTarget.length ? Math.max(...inTarget.map((t) => t.position)) + 1 : 0;
    void runTaskAction(task.id, () => tasksApi.updateStatus(task.id, to, position));
  }

  function deleteTask(task: Task) {
    void runTaskAction(task.id, () => tasksApi.remove(task.id));
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <nav aria-label="Breadcrumb" className="text-sm text-fg-inverse/60">
        <Link href="/app/projects" className="underline underline-offset-4 hover:text-fg-inverse">
          Projects
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-fg-inverse">
          {project.status === "success" ? project.data.name : "…"}
        </span>
      </nav>

      <header>
        {project.status === "loading" ? (
          <div role="status" aria-label="Loading project" className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight break-words">{project.data.name}</h1>
            <p className="mt-1 text-sm text-fg-inverse/60">
              Created {formatDate(project.data.createdAt)}
            </p>
          </>
        )}
      </header>

      <NewTaskForm projectId={projectId} onCreated={tasks.reload} />

      {actionError && <ErrorAlert tone="dark">{actionError}</ErrorAlert>}

      {tasks.status === "error" && <LoadError error={tasks.error} onRetry={tasks.reload} />}
      {tasks.status !== "error" && (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((column) => {
            const items = (tasks.data ?? [])
              .filter((task) => task.status === column.status)
              .sort((a, b) => a.position - b.position);
            return (
              <section
                key={column.status}
                aria-labelledby={`column-${column.status}`}
                className="flex flex-col gap-3 rounded-panel border border-white/10 bg-brand p-3"
              >
                <header className="flex items-center justify-between px-1">
                  <h2 id={`column-${column.status}`} className="text-sm font-semibold">
                    {STATUS_LABEL[column.status]}
                  </h2>
                  {tasks.status === "success" && (
                    <Badge>
                      {items.length}
                      <span className="sr-only"> {items.length === 1 ? "task" : "tasks"}</span>
                    </Badge>
                  )}
                </header>
                {tasks.status === "loading" ? (
                  <div role="status" aria-label={`Loading ${STATUS_LABEL[column.status]} tasks`} className="flex flex-col gap-2">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-fg-inverse/50">
                    No tasks {column.status === "done" ? "done yet" : "here"}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {items.map((task) => (
                      <li key={task.id}>
                        <TaskCard
                          task={task}
                          moves={column.moves}
                          busy={busyTaskId === task.id}
                          onMove={(to) => moveTask(task, to)}
                          onDelete={() => deleteTask(task)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewTaskForm({ projectId, onCreated }: { projectId: string; onCreated: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title")).trim();
    if (!title) {
      setError("Give the task a title.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await tasksApi.create(projectId, title);
      form.reset();
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          tone="dark"
          label="New task"
          name="title"
          placeholder="What needs to be done?"
          maxLength={500}
          autoComplete="off"
          error={error ?? undefined}
        />
      </div>
      <Button type="submit" tone="dark" loading={pending}>
        Add task
      </Button>
    </form>
  );
}

function ProjectNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-white/10 bg-surface-dark-raised px-6 py-14 text-center">
      <h1 className="text-xl font-semibold">Project not found</h1>
      <p className="text-sm text-fg-inverse/70">
        It may have been deleted, or it is not part of your organization.
      </p>
      <Link href="/app/projects" className="mt-2 text-sm font-medium underline underline-offset-4">
        Back to projects
      </Link>
    </div>
  );
}
