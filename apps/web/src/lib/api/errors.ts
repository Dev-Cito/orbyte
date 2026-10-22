import type { ApiErrorBody, Plan } from "./types";

// Any non-2xx answer from the API, with a message fit for display.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 401: no session, or it expired / was revoked. The client has already
// started the redirect to /login when this is thrown.
export class UnauthorizedError extends ApiError {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

// 403 PLAN_LIMIT_REACHED: the API refused because of the organization's plan.
// Pages display it as "upgrade required"; they decide nothing themselves.
export class PlanLimitError extends ApiError {
  constructor(
    message: string,
    readonly plan: Plan | undefined,
    readonly limit: string | undefined,
    readonly max: number | undefined,
  ) {
    super(403, message, "PLAN_LIMIT_REACHED");
    this.name = "PlanLimitError";
  }
}

export function toApiError(status: number, body: ApiErrorBody | null): ApiError {
  const message = messageOf(status, body);
  if (status === 403 && body?.code === "PLAN_LIMIT_REACHED") {
    return new PlanLimitError(message, body.plan, body.limit, body.max);
  }
  return new ApiError(status, message, body?.code);
}

function messageOf(status: number, body: ApiErrorBody | null): string {
  // Validation errors come as a list of messages.
  if (Array.isArray(body?.message)) return body.message.join(". ");
  if (body?.message) return body.message;
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "The request could not be completed.";
}
