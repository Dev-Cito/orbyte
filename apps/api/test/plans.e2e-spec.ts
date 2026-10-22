import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  Organization,
  type Plan,
} from './../src/organizations/organization.entity';
import { Project } from './../src/projects/project.entity';
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

interface LimitError {
  statusCode: number;
  code: string;
  message: string;
  plan: Plan;
  limit: string;
  max: number;
}

describe('Plan limits (e2e)', () => {
  const stripe = new FakeStripe();
  const tenants: Tenant[] = [];
  let app: INestApplication;
  let owner: DataSource;
  let secret: string;
  let pricePro: string;

  const newTenant = async (label: string) => {
    const tenant = await registerTenant(app, label);
    tenants.push(tenant);
    return tenant;
  };
  const createProject = (tenant: Tenant, name: string) =>
    api(app).post('/projects').set(bearer(tenant)).send({ name });
  const createProjects = async (tenant: Tenant, count: number) => {
    for (let i = 0; i < count; i++) {
      await createProject(tenant, `Project ${i + 1}`).expect(201);
    }
  };
  const storedCount = (tenant: Tenant) =>
    owner
      .getRepository(Project)
      .countBy({ organizationId: tenant.organizationId });
  // Stands in for a webhook when the plan itself is the point of the test.
  const setPlan = (tenant: Tenant, plan: Plan) =>
    owner.getRepository(Organization).update(tenant.organizationId, { plan });
  const usage = async (tenant: Tenant) =>
    (await api(app).get('/billing/usage').set(bearer(tenant)).expect(200))
      .body as unknown;

  const subscriptionEvent = async (
    tenant: Tenant,
    type: string,
    status: 'active' | 'canceled',
  ) => {
    const customer = `cus_${tenant.organizationId.slice(0, 8)}`;
    await owner
      .getRepository(Organization)
      .update(tenant.organizationId, { stripeCustomerId: customer });
    const subscription = stripe.setSubscription({
      id: `sub_${tenant.organizationId.slice(0, 8)}`,
      customer,
      priceId: pricePro,
      status,
      organizationId: tenant.organizationId,
    });
    const { payload, signature } = stripe.event(type, subscription, secret);
    await api(app)
      .post('/webhooks/stripe')
      .set('content-type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload)
      .expect(200);
  };

  beforeAll(async () => {
    app = await startApp(stripe);
    owner = await ownerDb();
    const config = app.get(ConfigService);
    secret = config.getOrThrow('STRIPE_WEBHOOK_SECRET');
    pricePro = config.getOrThrow('STRIPE_PRICE_PRO');
  });

  afterAll(async () => {
    await cleanup(tenants);
    await owner.destroy();
    await app.close();
  });

  it('a free organization creates up to 3 projects; the 4th is refused and not stored', async () => {
    const tenant = await newTenant('free');
    await createProjects(tenant, 3);

    const res = await createProject(tenant, 'One too many').expect(403);
    expect(res.body as LimitError).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      code: 'PLAN_LIMIT_REACHED',
      message:
        'Project limit reached for the free plan (3 projects). Upgrade to create more.',
      plan: 'free',
      limit: 'maxProjects',
      max: 3,
    });
    expect(await storedCount(tenant)).toBe(3);
  });

  it.each(['pro', 'business'] as const)(
    'a %s organization creates more than 3 projects',
    async (plan) => {
      const tenant = await newTenant(plan);
      await setPlan(tenant, plan);
      await createProjects(tenant, 6);
      expect(await storedCount(tenant)).toBe(6);
    },
  );

  it('after an upgrade to pro (webhook), the same organization goes past 3', async () => {
    const tenant = await newTenant('upgrade');
    await createProjects(tenant, 3);
    await createProject(tenant, 'Blocked').expect(403);

    await subscriptionEvent(tenant, 'customer.subscription.created', 'active');
    await createProjects(tenant, 2);
    expect(await storedCount(tenant)).toBe(5);
  });

  it('after a downgrade to free (webhook), existing projects stay but no new one is allowed', async () => {
    const tenant = await newTenant('downgrade');
    await subscriptionEvent(tenant, 'customer.subscription.created', 'active');
    await createProjects(tenant, 5);

    await subscriptionEvent(
      tenant,
      'customer.subscription.deleted',
      'canceled',
    );
    const list = await api(app)
      .get('/projects')
      .set(bearer(tenant))
      .expect(200);
    expect(list.body).toHaveLength(5);
    await createProject(tenant, 'Over the limit').expect(403);
    expect(await storedCount(tenant)).toBe(5);

    // Back under the limit by deleting: creation works again, up to 3.
    const ids = (list.body as { id: string }[]).map((p) => p.id);
    for (const id of ids.slice(0, 3)) {
      await api(app).delete(`/projects/${id}`).set(bearer(tenant)).expect(204);
    }
    await createProject(tenant, 'Fits again').expect(201);
    await createProject(tenant, 'Full again').expect(403);
  });

  it('GET /billing/usage reports usage and limits for the plan', async () => {
    const tenant = await newTenant('usage');
    await createProjects(tenant, 2);
    expect(await usage(tenant)).toEqual({
      plan: 'free',
      usage: { projects: 2 },
      limits: { maxProjects: 3 },
    });

    await setPlan(tenant, 'business');
    expect(await usage(tenant)).toEqual({
      plan: 'business',
      usage: { projects: 2 },
      limits: { maxProjects: null },
    });

    await api(app).get('/billing/usage').expect(401);
  });

  it('usage only counts the organization of the token', async () => {
    const busy = await newTenant('busy');
    const quiet = await newTenant('quiet');
    await createProjects(busy, 3);
    expect(await usage(quiet)).toMatchObject({ usage: { projects: 0 } });
  });

  it('concurrent creations at the limit never exceed it', async () => {
    const tenant = await newTenant('race');
    await createProjects(tenant, 2);

    // Makes the race window as wide as possible, deterministically: while
    // this owner transaction holds the organization row, every project
    // INSERT of that organization blocks on its foreign key check, AFTER the
    // request has read the plan and counted. Without serialization, all six
    // would count 2 and then insert.
    const blocker = owner.createQueryRunner();
    await blocker.connect();
    await blocker.startTransaction();
    await blocker.query('SELECT 1 FROM organization WHERE id = $1 FOR UPDATE', [
      tenant.organizationId,
    ]);
    const racers = 6;
    const pending = Promise.all(
      Array.from({ length: racers }, (_, i) =>
        createProject(tenant, `Racer ${i}`).then((r) => r.status),
      ),
    );
    // Wait until every request is stuck on a lock inside Postgres (on the
    // row, or on the per-organization quota lock), then let them all go.
    await waitFor(async () => {
      const [{ n }] = await owner.query<{ n: number }[]>(
        `SELECT count(*)::int AS n FROM pg_stat_activity
         WHERE usename = 'orbyte_app' AND wait_event_type = 'Lock'`,
      );
      return n >= racers;
    });
    await blocker.commitTransaction();
    await blocker.release();

    const statuses = (await pending).sort();
    expect(statuses).toEqual([201, 403, 403, 403, 403, 403]);
    expect(await storedCount(tenant)).toBe(3);
  });
});

async function waitFor(condition: () => Promise<boolean>, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (!(await condition())) {
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
