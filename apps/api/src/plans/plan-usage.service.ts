import { Injectable } from '@nestjs/common';
import { Organization, type Plan } from '../organizations/organization.entity';
import { Project } from '../projects/project.entity';
import { TenantDatabase } from '../tenancy/tenant-database';
import { PlanLimitReachedException } from './plan-limit-reached.exception';
import { hasRoom, PLAN_LIMITS, type PlanLimits } from './plan-limits';

// First key of the two-key advisory locks taken here, so they live in their
// own namespace (the billing webhook uses the one-key form, a separate
// keyspace in Postgres).
const PROJECT_QUOTA_LOCK = 1;

export interface UsageResponse {
  plan: Plan;
  usage: { projects: number };
  limits: PlanLimits;
}

// Enforces the plan limits. Runs inside the request's tenant transaction
// (TenantDatabase): counts go through the app filter AND Row-Level Security,
// so they only ever see the token's organization. The plan is read from the
// database, never from anything the client sends.
@Injectable()
export class PlanUsageService {
  constructor(private readonly tenantDb: TenantDatabase) {}

  // Call right before inserting a project, in the same tenant transaction.
  // The advisory lock serializes "count, then insert" per organization: a
  // concurrent creation waits until this transaction commits (or rolls
  // back), then counts the project inserted here. Without it, two requests
  // at 2/3 could both read 2 and both insert. Released at COMMIT/ROLLBACK.
  async assertCanCreateProject(organizationId: string): Promise<void> {
    await this.tenantDb.manager.query(
      'SELECT pg_advisory_xact_lock($1, hashtext($2))',
      [PROJECT_QUOTA_LOCK, organizationId],
    );
    // Read under the lock, so it is the plan at the time of this insert.
    const plan = await this.planOf(organizationId);
    const max = PLAN_LIMITS[plan].maxProjects;
    if (max === null) return;
    // Existing projects are never deleted on a downgrade: an organization
    // above the limit keeps them, but cannot create more until it is back
    // under the limit or upgrades.
    if (!hasRoom(max, await this.countProjects(organizationId))) {
      throw new PlanLimitReachedException(
        plan,
        'maxProjects',
        max,
        `Project limit reached for the ${plan} plan (${max} projects). Upgrade to create more.`,
      );
    }
  }

  // Informational, for the front end to display (e.g. "2/3 projects"). Not
  // an authority: creation is checked again by assertCanCreateProject.
  async usage(organizationId: string): Promise<UsageResponse> {
    const plan = await this.planOf(organizationId);
    return {
      plan,
      usage: { projects: await this.countProjects(organizationId) },
      limits: PLAN_LIMITS[plan],
    };
  }

  private async planOf(organizationId: string): Promise<Plan> {
    const org = await this.tenantDb.manager.findOneOrFail(Organization, {
      where: { id: organizationId },
      select: { id: true, plan: true },
    });
    return org.plan;
  }

  private countProjects(organizationId: string): Promise<number> {
    return this.tenantDb.getRepository(Project).countBy({ organizationId });
  }
}
