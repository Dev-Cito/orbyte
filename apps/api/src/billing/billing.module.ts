import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Membership } from '../memberships/membership.entity';
import { Organization } from '../organizations/organization.entity';
import { BillingController } from './billing.controller';
import { BillingPlans } from './billing-plans';
import { BillingService } from './billing.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { SubscriptionSyncService } from './subscription-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Membership]), AuthModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [BillingPlans, BillingService, SubscriptionSyncService],
})
export class BillingModule {}
