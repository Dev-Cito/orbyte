import { apiRequest } from "./client";
import { ApiError } from "./errors";
import type { PaidPlan, Usage } from "./types";

export const billingApi = {
  getUsage: () => apiRequest<Usage>("/billing/usage"),

  // Creates a Stripe Checkout Session for the organization of the session.
  // The caller sends the browser to `url` (Stripe-hosted). Nothing changes
  // here on success: the plan only moves when Stripe's webhook reaches the
  // API.
  startCheckout: async (plan: PaidPlan): Promise<{ url: string }> => {
    try {
      return await apiRequest<{ url: string }>("/billing/checkout", {
        method: "POST",
        body: { plan },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        throw new ApiError(403, "Only owners and admins can manage billing.", err.code);
      }
      if (err instanceof ApiError && err.status === 409) {
        throw new ApiError(
          409,
          "Your organization already has an active subscription. Changing plans isn't available from this page yet.",
          err.code,
        );
      }
      throw err;
    }
  },
};
