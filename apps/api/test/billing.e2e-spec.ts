import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { hashPassword } from './../src/auth/password';
import { Membership } from './../src/memberships/membership.entity';
import { Organization } from './../src/organizations/organization.entity';
import { User } from './../src/users/user.entity';
import { FakeStripe } from './fake-stripe';
import {
  api,
  bearer,
  cleanup,
  ownerDb,
  registerTenant,
  startApp,
  Tenant,
} from './helpers';

type Delivery = { payload: string; signature: string };

describe('Billing (e2e)', () => {
  const stripe = new FakeStripe();
  let app: INestApplication;
  let owner: DataSource;
  let a: Tenant;
  let b: Tenant;
  let member: Tenant;
  let secret: string;
  let pricePro: string;
  let priceBusiness: string;

  const deliver = ({ payload, signature }: Delivery) =>
    api(app)
      .post('/webhooks/stripe')
      .set('content-type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload);

  const billingOf = (tenant: Tenant) =>
    owner.getRepository(Organization).findOneOrFail({
      where: { id: tenant.organizationId },
      select: {
        plan: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

  const checkout = (tenant: Tenant, plan = 'pro') =>
    api(app).post('/billing/checkout').set(bearer(tenant)).send({ plan });

  beforeAll(async () => {
    app = await startApp(stripe);
    owner = await ownerDb();
    const config = app.get(ConfigService);
    secret = config.getOrThrow('STRIPE_WEBHOOK_SECRET');
    pricePro = config.getOrThrow('STRIPE_PRICE_PRO');
    priceBusiness = config.getOrThrow('STRIPE_PRICE_BUSINESS');
    a = await registerTenant(app, 'billing-a');
    b = await registerTenant(app, 'billing-b');

    // A plain member of org A (no invitation flow yet: inserted directly).
    const email = `billing-member-${randomUUID()}@example.com`;
    const password = `pw-${randomUUID()}`;
    const user = await owner.getRepository(User).save({
      email,
      name: 'member',
      passwordHash: await hashPassword(password),
    });
    await owner.getRepository(Membership).save({
      userId: user.id,
      organizationId: a.organizationId,
      role: 'member',
    });
    const login = await api(app)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    member = {
      userId: user.id,
      organizationId: a.organizationId,
      email,
      password,
      token: (login.body as { token: string }).token,
    };
  });

  afterAll(async () => {
    await cleanup([a, b, member]);
    await owner.destroy();
    await app.close();
  });

  describe('POST /billing/checkout', () => {
    it('creates a subscription Checkout Session tied to the organization', async () => {
      const res = await checkout(a).expect(201);
      expect((res.body as { url: string }).url).toMatch(
        /^https:\/\/checkout\.stripe\.test\//,
      );

      // A Customer was created for the organization, billed to its owner.
      expect(stripe.createdCustomers).toEqual([
        expect.objectContaining({
          email: a.email,
          metadata: { organizationId: a.organizationId },
        }),
      ]);
      const { stripeCustomerId } = await billingOf(a);
      expect(stripeCustomerId).toMatch(/^cus_/);

      const session = stripe.createdSessions[0];
      expect(session).toMatchObject({
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [{ price: pricePro, quantity: 1 }],
        metadata: { organizationId: a.organizationId },
        subscription_data: { metadata: { organizationId: a.organizationId } },
      });
      expect(session.success_url).toMatch(/\/billing\/success\?/);
      expect(session.cancel_url).toMatch(/\/billing\/cancel$/);
    });

    it('reuses the Customer of the organization', async () => {
      await checkout(a, 'business').expect(201);
      expect(stripe.createdCustomers).toHaveLength(1);
      const session = stripe.createdSessions.at(-1)!;
      expect(session.customer).toBe((await billingOf(a)).stripeCustomerId);
      expect(session.line_items).toEqual([
        { price: priceBusiness, quantity: 1 },
      ]);
    });

    it('refuses a member (only owner or admin manage billing)', async () => {
      const before = stripe.createdSessions.length;
      await checkout(member).expect(403);
      expect(stripe.createdSessions).toHaveLength(before);
    });

    it('only accepts a paid plan, and never an organizationId', async () => {
      await checkout(a, 'free').expect(400);
      await api(app)
        .post('/billing/checkout')
        .set(bearer(a))
        .send({ plan: 'pro', organizationId: b.organizationId })
        .expect(400);
    });

    it('requires authentication', async () => {
      await api(app)
        .post('/billing/checkout')
        .send({ plan: 'pro' })
        .expect(401);
    });
  });

  describe('POST /webhooks/stripe', () => {
    let customerA: string;
    let created: Delivery;
    let deleted: Delivery;

    beforeAll(async () => {
      customerA = (await billingOf(a)).stripeCustomerId!;
    });

    it('customer.subscription.created moves org A to its plan, org B untouched', async () => {
      const subscription = stripe.setSubscription({
        id: 'sub_a1',
        customer: customerA,
        priceId: pricePro,
        status: 'active',
        organizationId: a.organizationId,
      });
      created = stripe.event(
        'customer.subscription.created',
        subscription,
        secret,
      );
      await deliver(created).expect(200, { received: true });

      expect(await billingOf(a)).toMatchObject({
        plan: 'pro',
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_a1',
      });
      expect(await billingOf(b)).toMatchObject({
        plan: 'free',
        subscriptionStatus: null,
        stripeSubscriptionId: null,
      });
    });

    it('a duplicate delivery leaves the state unchanged', async () => {
      const before = await billingOf(a);
      await deliver(created).expect(200);
      await deliver(created).expect(200);
      expect(await billingOf(a)).toEqual(before);
    });

    it('customer.subscription.updated reflects a plan change (pro -> business)', async () => {
      const subscription = stripe.setSubscription({
        id: 'sub_a1',
        customer: customerA,
        priceId: priceBusiness,
        status: 'active',
        organizationId: a.organizationId,
      });
      await deliver(
        stripe.event('customer.subscription.updated', subscription, secret),
      ).expect(200);
      expect(await billingOf(a)).toMatchObject({
        plan: 'business',
        subscriptionStatus: 'active',
      });
    });

    it('a late event cannot roll the state back', async () => {
      // The "created" delivery still carries the old payload (pro). The state
      // is re-read from Stripe, which says business: business it stays.
      expect(created.payload).toContain(pricePro);
      await deliver(created).expect(200);
      expect((await billingOf(a)).plan).toBe('business');
    });

    it('invoice.payment_failed marks the organization past_due, plan kept', async () => {
      // What Stripe does when a renewal payment fails.
      stripe.setSubscription({
        id: 'sub_a1',
        customer: customerA,
        priceId: priceBusiness,
        status: 'past_due',
        organizationId: a.organizationId,
      });
      await deliver(
        stripe.event(
          'invoice.payment_failed',
          FakeStripe.invoiceFor('sub_a1', customerA),
          secret,
        ),
      ).expect(200);
      expect(await billingOf(a)).toMatchObject({
        plan: 'business',
        subscriptionStatus: 'past_due',
        stripeSubscriptionId: 'sub_a1',
      });
    });

    it('checkout is refused while a subscription is live', async () => {
      await checkout(a).expect(409);
    });

    it('customer.subscription.deleted sends the organization back to free', async () => {
      const subscription = stripe.setSubscription({
        id: 'sub_a1',
        customer: customerA,
        priceId: priceBusiness,
        status: 'canceled',
        organizationId: a.organizationId,
      });
      deleted = stripe.event(
        'customer.subscription.deleted',
        subscription,
        secret,
      );
      await deliver(deleted).expect(200);
      expect(await billingOf(a)).toMatchObject({
        plan: 'free',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
      });
      // Back to free: a new checkout is allowed again.
      await checkout(a).expect(201);
    });

    it('the end of an old subscription does not reset a newer one', async () => {
      const second = stripe.setSubscription({
        id: 'sub_a2',
        customer: customerA,
        priceId: pricePro,
        status: 'active',
        organizationId: a.organizationId,
      });
      await deliver(
        stripe.event('customer.subscription.created', second, secret),
      ).expect(200);
      // sub_a1's "deleted" delivered again, late.
      await deliver(deleted).expect(200);
      expect(await billingOf(a)).toMatchObject({
        plan: 'pro',
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_a2',
      });
    });

    it('finds the organization by its customer when metadata is missing', async () => {
      await checkout(b).expect(201);
      const customerB = (await billingOf(b)).stripeCustomerId!;
      const subscription = stripe.setSubscription({
        id: 'sub_b1',
        customer: customerB,
        priceId: pricePro,
        status: 'trialing',
      });
      await deliver(
        stripe.event('customer.subscription.created', subscription, secret),
      ).expect(200);
      expect(await billingOf(b)).toMatchObject({
        plan: 'pro',
        subscriptionStatus: 'trialing',
        stripeSubscriptionId: 'sub_b1',
      });
      expect((await billingOf(a)).stripeSubscriptionId).toBe('sub_a2');
    });

    it('rejects an invalid, missing or mismatched signature, without touching anything', async () => {
      const retrievals = stripe.retrievedSubscriptions.length;
      const before = await billingOf(a);
      const forged = stripe.event(
        'customer.subscription.deleted',
        { id: 'sub_a2' },
        'whsec_not_the_real_secret',
      );
      await deliver(forged).expect(400);
      await api(app)
        .post('/webhooks/stripe')
        .set('content-type', 'application/json')
        .send(forged.payload)
        .expect(400);
      // A valid signature, but of another body.
      const genuine = stripe.event('customer.subscription.deleted', {}, secret);
      await deliver({
        payload: forged.payload,
        signature: genuine.signature,
      }).expect(400);

      expect(stripe.retrievedSubscriptions).toHaveLength(retrievals);
      expect(await billingOf(a)).toEqual(before);
    });

    it('acknowledges other event types without doing anything', async () => {
      const retrievals = stripe.retrievedSubscriptions.length;
      await deliver(
        stripe.event('customer.created', { id: customerA }, secret),
      ).expect(200, { received: true });
      expect(stripe.retrievedSubscriptions).toHaveLength(retrievals);
    });

    it('fails (so Stripe retries) on a price that matches no plan', async () => {
      const before = await billingOf(a);
      const subscription = stripe.setSubscription({
        id: 'sub_a2',
        customer: customerA,
        priceId: 'price_unknown',
        status: 'active',
        organizationId: a.organizationId,
      });
      await deliver(
        stripe.event('customer.subscription.updated', subscription, secret),
      ).expect(500);
      expect(await billingOf(a)).toEqual(before);
    });
  });
});
