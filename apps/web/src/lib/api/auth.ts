import { apiRequest, request } from "./client";
import type { LoginInput, RegisterInput, Session } from "./types";

// Login and register go through dedicated route handlers: they set the
// httpOnly session cookie and return the session without the token.
export const authApi = {
  login: (input: LoginInput) =>
    request<Session>("/api/auth/login", {
      method: "POST",
      body: input,
      redirectOnUnauthorized: false,
    }),

  register: (input: RegisterInput) =>
    request<Session>("/api/auth/register", { method: "POST", body: input }),

  logout: () =>
    request<void>("/api/auth/logout", { method: "POST", redirectOnUnauthorized: false }),

  me: () => apiRequest<Session>("/auth/me"),
};
