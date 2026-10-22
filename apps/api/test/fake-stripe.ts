import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';

interface FakeSubscriptionInput {
  id: string;
  customer: string;
  priceId: string;
  status: Stripe.Subscription.Status;
  organizationId?: string;
}

// Stands in for the Stripe client in e2e tests: nothing reaches the network.
// It keeps the "current" state of subscriptions (what subscriptions.retrieve
// returns, as Stripe would), and signs webhook payloads with the real
// algorithm so the app's signature check runs for real.
export class FakeStripe {
  // Only used for its webhooks helper (pure HMAC, no request is ever made).
  private readonly signer = new Stripe('sk_test_fake_never_used');
  readonly webhooks = this.signer.webhooks;

  readonly createdCustomers: Stripe.CustomerCreateParams[] = [];
  readonly createdSessions: Stripe.Checkout.SessionCreateParams[] = [];
  readonly retrievedSubscriptions: string[] = [];
  private readonly subscriptionsById = new Map<string, Stripe.Subscription>();

  readonly customers = {
    create: (params: Stripe.CustomerCreateParams) => {
      this.createdCustomers.push(params);
      return Promise.resolve({
        id: `cus_${randomUUID().slice(0, 8)}`,
        object: 'customer',
        email: params.email,
        metadata: params.metadata,
      } as Stripe.Customer);
    },
  };

  readonly checkout = {
    sessions: {
      create: (params: Stripe.Checkout.SessionCreateParams) => {
        this.createdSessions.push(params);
        const id = `cs_test_${randomUUID().slice(0, 8)}`;
        return Promise.resolve({
          id,
          object: 'checkout.session',
          url: `https://checkout.stripe.test/c/${id}`,
        } as Stripe.Checkout.Session);
      },
    },
  };

  readonly subscriptions = {
    retrieve: (id: string) => {
      this.retrievedSubscriptions.push(id);
      const subscription = this.subscriptionsById.get(id);
      if (!subscription) {
        return Promise.reject(new Error(`No such subscription: '${id}'`));
      }
      return Promise.resolve(structuredClone(subscription));
    },
  };

  // Sets what Stripe currently holds for a subscription, and returns it.
  setSubscription(input: FakeSubscriptionInput): Stripe.Subscription {
    const subscription = {
      id: input.id,
      object: 'subscription',
      customer: input.customer,
      status: input.status,
      metadata: input.organizationId
        ? { organizationId: input.organizationId }
        : {},
      items: { object: 'list', data: [{ price: { id: input.priceId } }] },
    } as unknown as Stripe.Subscription;
    this.subscriptionsById.set(input.id, subscription);
    return structuredClone(subscription);
  }

  // A webhook delivery: the exact body and a valid stripe-signature header.
  event(
    type: string,
    object: object,
    secret: string,
  ): { id: string; payload: string; signature: string } {
    const id = `evt_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const payload = JSON.stringify({
      id,
      object: 'event',
      type,
      api_version: '2026-09-30.endive',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: { object },
    });
    const signature = this.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    return { id, payload, signature };
  }

  // An invoice event payload pointing at a subscription (current API shape).
  static invoiceFor(subscriptionId: string, customer: string): object {
    return {
      id: `in_${randomUUID().slice(0, 8)}`,
      object: 'invoice',
      customer,
      parent: {
        type: 'subscription_details',
        subscription_details: { subscription: subscriptionId },
      },
    };
  }
}
