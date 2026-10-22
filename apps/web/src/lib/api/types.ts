// Shapes returned by the Orbyte API (apps/api). Display-only on this side:
// the API is the only authority on what a user may do.

export type Plan = "free" | "pro" | "business";
export type Role = "owner" | "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: Plan;
  createdAt: string;
}

// GET /auth/me. Login and register return the same, plus a token that the
// web server keeps in an httpOnly cookie and never hands to the browser.
export interface Session {
  user: User;
  organization: Organization;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  organizationName: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
}

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  status: TaskStatus;
  position: number;
  createdAt: string;
}

// GET /billing/usage. Informational: the API enforces the limits itself.
export interface Usage {
  plan: Plan;
  usage: { projects: number };
  // null: unlimited.
  limits: { maxProjects: number | null };
}

// Error body of the API (Nest's default shape, plus the plan-limit fields).
export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
  plan?: Plan;
  limit?: string;
  max?: number;
}
