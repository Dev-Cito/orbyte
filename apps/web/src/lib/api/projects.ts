import { apiRequest } from "./client";
import type { Project } from "./types";

// Always scoped to the organization of the session by the API: no
// organization id is ever sent from here.
export const projectsApi = {
  list: () => apiRequest<Project[]>("/projects"),

  get: (id: string) => apiRequest<Project>(`/projects/${encodeURIComponent(id)}`),

  // Rejected with PlanLimitError when the plan's project limit is reached.
  create: (name: string) =>
    apiRequest<Project>("/projects", { method: "POST", body: { name } }),

  remove: (id: string) =>
    apiRequest<void>(`/projects/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
