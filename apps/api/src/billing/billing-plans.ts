import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Plan } from '../organizations/organization.entity';

// 'free' has no Stripe price: it is what an organization has without a
// (live) subscription.
export const PAID_PLANS = ['pro', 'business'] as const;
export type PaidPlan = (typeof PAID_PLANS)[number] & Plan;

// Two-way mapping between paid plans and their recurring Stripe Prices, read
// from the environment (the Prices live in the Stripe dashboard).
@Injectable()
export class BillingPlans {
  private readonly priceByPlan: Record<PaidPlan, string>;
  private readonly planByPrice: Map<string, PaidPlan>;

  constructor(config: ConfigService) {
    this.priceByPlan = {
      pro: config.getOrThrow<string>('STRIPE_PRICE_PRO'),
      business: config.getOrThrow<string>('STRIPE_PRICE_BUSINESS'),
    };
    this.planByPrice = new Map(
      PAID_PLANS.map((plan) => [this.priceByPlan[plan], plan]),
    );
    // Two plans on one price would make webhooks ambiguous.
    if (this.planByPrice.size !== PAID_PLANS.length) {
      throw new Error('STRIPE_PRICE_PRO and STRIPE_PRICE_BUSINESS must differ');
    }
  }

  priceFor(plan: PaidPlan): string {
    return this.priceByPlan[plan];
  }

  planForPrice(priceId: string): PaidPlan | undefined {
    return this.planByPrice.get(priceId);
  }
}
