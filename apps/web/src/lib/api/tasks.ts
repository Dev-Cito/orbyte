import { apiRequest } from "./client";
import type { Task, TaskStatus } from "./types";

export const tasksApi = {
  listByProject: (projectId: string) =>
    apiRequest<Task[]>(`/projects/${encodeURIComponent(projectId)}/tasks`),

  create: (projectId: string, title: string) =>
    apiRequest<Task>(`/projects/${encodeURIComponent(projectId)}/tasks`, {
      method: "POST",
      body: { title },
    }),

  // Moves a task to another column; position orders it within the column.
  updateStatus: (taskId: string, status: TaskStatus, position?: number) =>
    apiRequest<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      body: position === undefined ? { status } : { status, position },
    }),

  remove: (taskId: string) =>
    apiRequest<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" }),
};
