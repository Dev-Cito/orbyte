import { ForbiddenException } from '@nestjs/common';
import type { Plan } from '../organizations/organization.entity';
import type { PlanLimits } from './plan-limits';

// 403 with a machine-readable code, so a client can tell "your plan does not
// allow this" (offer an upgrade) from "your role does not allow this".
export class PlanLimitReachedException extends ForbiddenException {
  constructor(
    plan: Plan,
    limit: keyof PlanLimits,
    max: number,
    message: string,
  ) {
    super({
      statusCode: 403,
      error: 'Forbidden',
      code: 'PLAN_LIMIT_REACHED',
      message,
      plan,
      limit,
      max,
    });
  }
}
