// One module per API area. The next ones (projects, tasks, billing) follow
// the auth pattern: typed functions over apiRequest.
export { authApi } from "./auth";
export { apiRequest } from "./client";
export { ApiError, PlanLimitError, UnauthorizedError } from "./errors";
export type * from "./types";
