import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { DataSource, EntityManager } from 'typeorm';
import { Organization, type Plan } from '../organizations/organization.entity';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { BillingPlans } from './billing-plans';
import { ENTITLED_STATUSES, TERMINAL_STATUSES } from './subscription-status';

export type SyncResult =
  | {
      outcome: 'applied';
      organizationId: string;
      plan: Plan;
      status: string;
    }
  | {
      outcome: 'ignored';
      reason: 'organization_not_found' | 'customer_mismatch' | 'stale';
    };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mirrors a Stripe subscription onto its organization.
//
// Webhook payloads are snapshots that can arrive late, twice, or out of
// order. So the payload only says WHICH subscription changed; its state is
// re-read from Stripe here, and that current state is what gets written. A
// late event re-reads the same current state as a fresh one, so it can never
// roll the organization back, and replaying an event rewrites the same values
// (idempotent by construction).
//
// Runs as orbyte_app WITHOUT a tenant context (a webhook has no user and no
// organization until the subscription names one). It only touches
// "organization", which is not under Row-Level Security.
@Injectable()
export class SubscriptionSyncService {
  private readonly logger = new Logger(SubscriptionSyncService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly plans: BillingPlans,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  sync(subscriptionId: string): Promise<SyncResult> {
    return this.dataSource.transaction(async (manager) => {
      // Two deliveries for the same subscription are applied one after the
      // other: the second one only re-reads Stripe once the first has
      // committed, so an older read can never be written last. Released at
      // COMMIT/ROLLBACK. This holds a connection during one Stripe call,
      // which is acceptable for webhook traffic.
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [subscriptionId],
      );
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.apply(manager, subscription);
    });
  }

  private async apply(
    manager: EntityManager,
    subscription: Stripe.Subscription,
  ): Promise<SyncResult> {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    const org = await this.findOrganization(manager, subscription, customerId);
    if (!org) {
      // Retrying would not help: acknowledge and log.
      this.logger.warn(
        `Subscription ${subscription.id}: no organization for it, ignored`,
      );
      return { outcome: 'ignored', reason: 'organization_not_found' };
    }
    // The metadata names an organization billed to another customer: do not
    // let a foreign subscription change this organization's plan.
    if (org.stripeCustomerId && org.stripeCustomerId !== customerId) {
      this.logger.error(
        `Subscription ${subscription.id}: customer does not match organization ${org.id}, ignored`,
      );
      return { outcome: 'ignored', reason: 'customer_mismatch' };
    }

    const isTerminal = TERMINAL_STATUSES.has(subscription.status);
    // The end of an older subscription (e.g. its "deleted" event delivered
    // after a new subscription started) must not reset the current one.
    if (
      isTerminal &&
      org.stripeSubscriptionId &&
      org.stripeSubscriptionId !== subscription.id
    ) {
      this.logger.log(
        `Subscription ${subscription.id}: ended, but organization ${org.id} has moved on to another one, ignored`,
      );
      return { outcome: 'ignored', reason: 'stale' };
    }
    // Checkout refuses a second subscription, so this only happens if one
    // was made by hand in Stripe. The live one being reported wins.
    if (
      !isTerminal &&
      org.stripeSubscriptionId &&
      org.stripeSubscriptionId !== subscription.id
    ) {
      this.logger.warn(
        `Subscription ${subscription.id}: replaces ${org.stripeSubscriptionId} on organization ${org.id}`,
      );
    }

    let plan: Plan = 'free';
    if (!isTerminal && ENTITLED_STATUSES.has(subscription.status)) {
      const priceId = subscription.items.data[0]?.price.id;
      const paidPlan = priceId ? this.plans.planForPrice(priceId) : undefined;
      // A price we do not know is a configuration error: fail, so Stripe
      // retries the webhook once STRIPE_PRICE_* is fixed.
      if (!paidPlan) {
        throw new Error(
          `Subscription ${subscription.id}: price ${priceId} matches no plan`,
        );
      }
      plan = paidPlan;
    }

    await manager.update(Organization, org.id, {
      plan,
      subscriptionStatus: subscription.status,
      stripeSubscriptionId: isTerminal ? null : subscription.id,
      stripeCustomerId: customerId,
    });
    this.logger.log(
      `Subscription ${subscription.id}: organization ${org.id} -> ${plan} (${subscription.status})`,
    );
    return {
      outcome: 'applied',
      organizationId: org.id,
      plan,
      status: subscription.status,
    };
  }

  // The organization in the subscription's metadata (set at checkout), else
  // the one billed to its customer (e.g. a subscription made in the Stripe
  // dashboard). Locked until COMMIT: the checks above and the write below
  // see the same row.
  private async findOrganization(
    manager: EntityManager,
    subscription: Stripe.Subscription,
    customerId: string,
  ): Promise<Organization | null> {
    const repo = manager.getRepository(Organization);
    const lock = { mode: 'pessimistic_write' } as const;
    const fromMetadata = subscription.metadata?.organizationId;
    if (fromMetadata && UUID_RE.test(fromMetadata)) {
      const org = await repo.findOne({ where: { id: fromMetadata }, lock });
      if (org) return org;
    }
    return repo.findOne({ where: { stripeCustomerId: customerId }, lock });
  }
}
