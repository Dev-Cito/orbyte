import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import request from 'supertest';
import { DataSource, In } from 'typeorm';
import { AppModule } from './../src/app.module';
import ownerDataSource from './../src/database/data-source';
import { Organization } from './../src/organizations/organization.entity';
import { STRIPE_CLIENT } from './../src/stripe/stripe.module';
import { User } from './../src/users/user.entity';
import { FakeStripe } from './fake-stripe';

export interface Tenant {
  userId: string;
  organizationId: string;
  email: string;
  password: string;
  token: string;
}

interface AuthBody {
  token: string;
  user: { id: string };
  organization: { id: string };
}

// Boots the full app (global ValidationPipe included, it lives in AppModule),
// with the same rawBody option as main.ts. Stripe is always faked: no test
// can reach the real API. Pass a FakeStripe to drive and inspect it.
export async function startApp(
  stripe: FakeStripe = new FakeStripe(),
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(STRIPE_CLIENT)
    .useValue(stripe)
    .compile();
  const app = moduleRef.createNestApplication({ rawBody: true });
  await app.init();
  return app;
}

export function api(app: INestApplication) {
  return request(app.getHttpServer() as Server);
}

// Registers a brand-new organization with its owner, then logs in to get the
// token the tests will use. Unique emails keep suites independent of the
// seed and of each other.
export async function registerTenant(
  app: INestApplication,
  label: string,
): Promise<Tenant> {
  const email = `${label}-${randomUUID()}@example.com`;
  const password = `pw-${randomUUID()}`;
  const registered = await api(app)
    .post('/auth/register')
    .send({
      email,
      password,
      name: `${label} owner`,
      organizationName: `${label} org`,
    })
    .expect(201);
  const loggedIn = await api(app)
    .post('/auth/login')
    .send({ email, password })
    .expect(200);
  const body = registered.body as AuthBody;
  return {
    userId: body.user.id,
    organizationId: body.organization.id,
    email,
    password,
    token: (loggedIn.body as AuthBody).token,
  };
}

// The owner connection (DATABASE_MIGRATION_URL), for setup checks and
// cleanup. Assertions on what is really stored must not go through the app
// role: without a tenant context, RLS shows it no rows at all, so a
// "count is 0" check would pass for the wrong reason.
export async function ownerDb(): Promise<DataSource> {
  if (!ownerDataSource.isInitialized) await ownerDataSource.initialize();
  return ownerDataSource;
}

// Deleting the organizations cascades to memberships, projects and tasks.
export async function cleanup(tenants: Tenant[]) {
  const dataSource = await ownerDb();
  const present = tenants.filter(Boolean);
  if (!present.length) return;
  await dataSource
    .getRepository(Organization)
    .delete({ id: In(present.map((t) => t.organizationId)) });
  await dataSource
    .getRepository(User)
    .delete({ id: In(present.map((t) => t.userId)) });
}

export function bearer(tenant: Tenant) {
  return { authorization: `Bearer ${tenant.token}` };
}
