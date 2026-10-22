import { ApiError } from "@/lib/api";

// A message fit for display, for any thrown value.
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
