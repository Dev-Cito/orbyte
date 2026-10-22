import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AuthContext } from '../auth/auth-context';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

// JwtAuthGuard only, not @TenantRoute(): billing touches no tenant table and
// calls Stripe, which must not happen inside a held database transaction.
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  checkout(
    @CurrentAuth() auth: AuthContext,
    @Body() input: CreateCheckoutDto,
  ): Promise<{ url: string }> {
    return this.billingService.createCheckout(auth, input.plan);
  }
}
