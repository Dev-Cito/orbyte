import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      // Stripe Checkout returns to FRONTEND_URL/billing/success?session_id=...
      // and FRONTEND_URL/billing/cancel (set by the API, apps/api
      // BillingService). The pages live under /app, behind the session check;
      // the query string is passed through.
      {
        source: "/billing/:outcome(success|cancel)",
        destination: "/app/billing/:outcome",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
