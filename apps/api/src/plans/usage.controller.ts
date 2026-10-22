import { Controller, Get } from '@nestjs/common';
import type { AuthContext } from '../auth/auth-context';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { TenantRoute } from '../tenancy/tenant-route.decorator';
import { PlanUsageService, type UsageResponse } from './plan-usage.service';

// A tenant route: the project count runs under Row-Level Security.
@Controller('billing')
@TenantRoute()
export class UsageController {
  constructor(private readonly planUsage: PlanUsageService) {}

  @Get('usage')
  usage(@CurrentAuth() auth: AuthContext): Promise<UsageResponse> {
    return this.planUsage.usage(auth.organizationId);
  }
}
