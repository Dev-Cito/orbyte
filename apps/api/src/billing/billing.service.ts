import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { IsNull, Repository } from 'typeorm';
import type { AuthContext } from '../auth/auth-context';
import { Membership, type Role } from '../memberships/membership.entity';
import { Organization } from '../organizations/organization.entity';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { BillingPlans, type PaidPlan } from './billing-plans';
import { TERMINAL_STATUSES } from './subscription-status';

const BILLING_ROLES: ReadonlySet<Role> = new Set(['owner', 'admin']);

// Runs as orbyte_app, outside any tenant transaction: "organization" is not
// under Row-Level Security, and the only row touched is the token's own
// organization (by its id). No database transaction is held open while
// Stripe is called over the network.
@Injectable()
export class BillingService {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly plans: BillingPlans,
    private readonly config: ConfigService,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
  ) {}

  async createCheckout(
    auth: AuthContext,
    plan: PaidPlan,
  ): Promise<{ url: string }> {
    // The role comes from the membership (re-read by the guard on every
    // request), not from the token claims.
    if (!BILLING_ROLES.has(auth.role)) {
      throw new ForbiddenException('Only an owner or admin can manage billing');
    }
    const org = await this.organizations.findOneByOrFail({
      id: auth.organizationId,
    });
    // A second checkout would start a second, parallel subscription. Plan
    // changes go through the existing subscription instead.
    if (
      org.stripeSubscriptionId &&
      !TERMINAL_STATUSES.has(org.subscriptionStatus ?? '')
    ) {
      throw new ConflictException('Organization already has a subscription');
    }

    const customerId = org.stripeCustomerId ?? (await this.createCustomer(org));
    const metadata = { organizationId: org.id };
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: this.plans.priceFor(plan), quantity: 1 }],
      client_reference_id: org.id,
      // On the session, and copied onto the subscription it creates: every
      // subscription webhook then names its organization.
      metadata,
      subscription_data: { metadata },
      success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing/cancel`,
    });
    if (!session.url) throw new Error('Checkout Session created without a url');
    return { url: session.url };
  }

  // One Stripe Customer per organization, billed to its owner's email.
  private async createCustomer(org: Organization): Promise<string> {
    const owner = await this.memberships.findOneOrFail({
      where: { organizationId: org.id, role: 'owner' },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
    const customer = await this.stripe.customers.create(
      {
        email: owner.user.email,
        name: org.name,
        metadata: { organizationId: org.id },
      },
      // Concurrent or retried checkouts of the same organization get the same
      // Customer back from Stripe (keys are honoured for 24 hours).
      { idempotencyKey: `organization-customer-${org.id}` },
    );

    // Only fills an empty slot: never overwrites a customer stored meanwhile.
    const { affected } = await this.organizations.update(
      { id: org.id, stripeCustomerId: IsNull() },
      { stripeCustomerId: customer.id },
    );
    if (affected) return customer.id;
    const stored = await this.organizations.findOneByOrFail({ id: org.id });
    return stored.stripeCustomerId ?? customer.id;
  }
}
