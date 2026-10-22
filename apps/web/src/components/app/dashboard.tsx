"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { billingApi, projectsApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useResource } from "@/lib/use-resource";
import { LoadError } from "./load-error";
import { isAtProjectLimit } from "./plan";
import { PlanBadge } from "./plan-badge";
import { PlanLimitNotice } from "./plan-limit-notice";
import { UsageCard } from "./usage-card";
import { useSessionPlanSync } from "./use-session-plan-sync";

const RECENT = 5;

export function Dashboard() {
  const { user, organization, plan: sessionPlan } = useAuth();
  const usage = useResource("usage", billingApi.getUsage);
  const projects = useResource("projects", projectsApi.list);
  useSessionPlanSync(usage);
  // Usage is fetched fresh; the session's plan covers the first paint.
  const plan = usage.status === "success" ? usage.data.plan : sessionPlan;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-fg-inverse/60">Welcome back, {user.name}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{organization.name}</h1>
        </div>
        <PlanBadge plan={plan} />
      </header>

      {usage.status === "success" && isAtProjectLimit(usage.data) && (
        <PlanLimitNotice>
          The {plan} plan includes {usage.data.limits.maxProjects} projects. Upgrade for unlimited
          projects.
        </PlanLimitNotice>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <UsageCard usage={usage} />

        <Card tone="dark" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg-inverse/70">Recent projects</h2>
            <Link href="/app/projects" className="text-sm font-medium underline underline-offset-4">
              All projects
            </Link>
          </div>
          {projects.status === "loading" && (
            <div role="status" aria-label="Loading projects" className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          )}
          {projects.status === "error" && (
            <LoadError error={projects.error} onRetry={projects.reload} />
          )}
          {projects.status === "success" &&
            (projects.data.length === 0 ? (
              <p className="text-sm text-fg-inverse/70">
                No projects yet.{" "}
                <Link href="/app/projects" className="font-medium text-fg-inverse underline underline-offset-4">
                  Create your first one
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/10">
                {[...projects.data]
                  .reverse()
                  .slice(0, RECENT)
                  .map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-white/5"
                      >
                        <span className="truncate font-medium">{project.name}</span>
                        <span className="shrink-0 text-xs text-fg-inverse/60">
                          {formatDate(project.createdAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            ))}
        </Card>
      </div>
    </div>
  );
}
