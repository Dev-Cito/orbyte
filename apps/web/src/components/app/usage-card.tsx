"use client";

import Link from "next/link";
import type { Usage } from "@/lib/api";
import type { Resource } from "@/lib/use-resource";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "./load-error";
import { isAtProjectLimit } from "./plan";

// Projects used against the plan's limit. Numbers are always written out;
// the bar only illustrates them.
export function UsageCard({ usage }: { usage: Resource<Usage> & { reload: () => void } }) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-fg-secondary">Projects</h2>
      {usage.status === "loading" && (
        <div role="status" aria-label="Loading usage" className="flex flex-col gap-3">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      )}
      {usage.status === "error" && <LoadError error={usage.error} onRetry={usage.reload} />}
      {usage.status === "success" && <UsageFigures usage={usage.data} />}
    </Card>
  );
}

function UsageFigures({ usage }: { usage: Usage }) {
  const used = usage.usage.projects;
  const max = usage.limits.maxProjects;
  const unit = used === 1 ? "project" : "projects";

  if (max === null) {
    return (
      <p className="text-2xl font-semibold">
        {used} {unit} <span className="text-base font-normal text-fg-muted">· Unlimited</span>
      </p>
    );
  }

  const atLimit = isAtProjectLimit(usage);
  const remaining = Math.max(0, max - used);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xl font-semibold">
        {used} / {max} <span className="text-base font-normal text-fg-muted">projects</span>
      </p>
      <ProgressBar value={used} max={max} label="Projects used" emphasis={atLimit} />
      <p className="text-sm text-fg-secondary">
        {used > max
          ? `Over the limit of your plan by ${used - max}. Existing projects are kept.`
          : atLimit
            ? "Limit reached."
            : `${remaining} remaining on your plan.`}{" "}
        <Link href="/app/projects" className="font-medium text-fg underline underline-offset-4">
          View projects
        </Link>
      </p>
    </div>
  );
}
