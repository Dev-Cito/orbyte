"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { PlanBadge } from "./plan-badge";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", member: "Member" } as const;

// Top nav contents: who is signed in, in which organization, on which plan.
// Display only.
export function SessionSummary() {
  const { user, organization, role, plan } = useAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    try {
      await authApi.logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-sm font-semibold">{organization.name}</span>
        <PlanBadge plan={plan} />
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-right text-xs leading-tight sm:block">
          <span className="block text-sm text-fg-inverse">{user.name}</span>
          <span className="text-fg-inverse/60">{ROLE_LABEL[role]}</span>
        </span>
        <Button variant="ghost" tone="dark" onClick={signOut} loading={leaving}>
          Sign out
        </Button>
      </div>
    </>
  );
}
