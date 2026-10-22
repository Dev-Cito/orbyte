"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";

// Placeholder until the dashboard pages land. Shows what the session
// context carries, for the next pass to build on.
export function DashboardPlaceholder() {
  const { user, organization, role, plan } = useAuth();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard — coming next</h1>
        <p className="mt-1 text-sm text-fg-inverse/70">
          Welcome, {user.name}. Projects and billing arrive in the next iteration.
        </p>
      </div>
      <Card tone="dark">
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Field label="Organization" value={organization.name} />
          <Field label="Plan" value={plan} />
          <Field label="Your role" value={role} />
          <Field label="Email" value={user.email} />
        </dl>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-fg-inverse/60">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
