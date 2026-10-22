// One module per API area: typed functions over apiRequest.
export { authApi } from "./auth";
export { billingApi } from "./billing";
export { apiRequest } from "./client";
export { ApiError, PlanLimitError, UnauthorizedError } from "./errors";
export { projectsApi } from "./projects";
export { tasksApi } from "./tasks";
export { TASK_STATUSES } from "./types";
export type * from "./types";
