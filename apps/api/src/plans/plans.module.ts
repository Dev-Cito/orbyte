import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { PlanUsageService } from './plan-usage.service';
import { UsageController } from './usage.controller';

@Module({
  imports: [AuthModule, TenancyModule],
  controllers: [UsageController],
  providers: [PlanUsageService],
  exports: [PlanUsageService],
})
export class PlansModule {}
