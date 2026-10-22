import { apiRequest } from "./client";
import type { Usage } from "./types";

// Checkout arrives with the billing pages.
export const billingApi = {
  getUsage: () => apiRequest<Usage>("/billing/usage"),
};
