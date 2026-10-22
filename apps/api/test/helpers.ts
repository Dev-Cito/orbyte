import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import request from 'supertest';
import { DataSource, In } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Organization } from './../src/organizations/organization.entity';
import { User } from './../src/users/user.entity';

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

// Boots the full app (global ValidationPipe included, it lives in AppModule).
export async function startApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
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

// Deleting the organizations cascades to memberships, projects and tasks.
export async function cleanup(app: INestApplication, tenants: Tenant[]) {
  const dataSource = app.get(DataSource);
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
