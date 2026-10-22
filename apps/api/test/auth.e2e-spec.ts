import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { jwtModuleOptions } from './../src/auth/jwt-options';
import { Membership } from './../src/memberships/membership.entity';
import { Organization } from './../src/organizations/organization.entity';
import { User } from './../src/users/user.entity';
import {
  api,
  bearer,
  cleanup,
  registerTenant,
  startApp,
  Tenant,
} from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let alice: Tenant;

  beforeAll(async () => {
    app = await startApp();
    dataSource = app.get(DataSource);
    alice = await registerTenant(app, 'alice');
  });

  afterAll(async () => {
    await cleanup(app, [alice]);
    await app.close();
  });

  it('register creates the user, a free organization and an owner membership', async () => {
    const user = await dataSource
      .getRepository(User)
      .findOneByOrFail({ id: alice.userId });
    const org = await dataSource
      .getRepository(Organization)
      .findOneByOrFail({ id: alice.organizationId });
    const memberships = await dataSource
      .getRepository(Membership)
      .findBy({ userId: alice.userId });

    expect(user.email).toBe(alice.email);
    expect(org).toMatchObject({ name: 'alice org', plan: 'free' });
    expect(memberships).toHaveLength(1);
    expect(memberships[0]).toMatchObject({
      organizationId: alice.organizationId,
      role: 'owner',
    });
  });

  it('stores an argon2id hash, never the plain password', async () => {
    const row = await dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where({ id: alice.userId })
      .getOneOrFail();
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
    expect(row.passwordHash).not.toContain(alice.password);
  });

  it('the token carries the user, the active organization and the role', () => {
    const claims = app
      .get(JwtService)
      .decode<Record<string, unknown>>(alice.token);
    expect(claims).toMatchObject({
      sub: alice.userId,
      org: alice.organizationId,
      role: 'owner',
    });
  });

  it('me returns the user, the organization and the role of the token', async () => {
    const res = await api(app).get('/auth/me').set(bearer(alice)).expect(200);
    expect(res.body).toEqual({
      user: {
        id: alice.userId,
        email: alice.email,
        name: 'alice owner',
        createdAt: expect.any(String) as unknown,
      },
      organization: {
        id: alice.organizationId,
        name: 'alice org',
        plan: 'free',
        createdAt: expect.any(String) as unknown,
      },
      role: 'owner',
    });
  });

  it('never exposes passwordHash', async () => {
    const login = await api(app)
      .post('/auth/login')
      .send({ email: alice.email, password: alice.password })
      .expect(200);
    const me = await api(app).get('/auth/me').set(bearer(alice)).expect(200);
    for (const res of [login, me]) {
      expect(res.text).not.toContain('passwordHash');
      expect(res.text).not.toContain('$argon2');
    }
  });

  it('me fails without a token, with a forged one, or with a token of another secret', async () => {
    const otherSecret = await new JwtService({
      secret: 'x'.repeat(48),
    }).signAsync({
      sub: alice.userId,
      org: alice.organizationId,
      role: 'owner',
    });
    await api(app).get('/auth/me').expect(401);
    await api(app)
      .get('/auth/me')
      .set({ authorization: `Bearer ${alice.token}x` })
      .expect(401);
    await api(app)
      .get('/auth/me')
      .set({ authorization: `Bearer ${otherSecret}` })
      .expect(401);
  });

  it('login gives the same generic error for an unknown email and a wrong password', async () => {
    const wrongPassword = await api(app)
      .post('/auth/login')
      .send({ email: alice.email, password: 'wrong-password' })
      .expect(401);
    const unknownEmail = await api(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: alice.password })
      .expect(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect((wrongPassword.body as { message: string }).message).toBe(
      'Invalid credentials',
    );
  });

  it('refuses a duplicate email and rolls the whole registration back', async () => {
    const organizationName = `Duplicate ${randomUUID()}`;
    const res = await api(app)
      .post('/auth/register')
      .send({
        email: alice.email.toUpperCase(),
        name: 'Alice again',
        password: 'another-password',
        organizationName,
      })
      .expect(409);
    expect((res.body as { message: string }).message).toBe(
      'Email already registered',
    );
    // The organization is inserted before the user inside the transaction:
    // the email conflict must have rolled it back, leaving no orphan.
    expect(
      await dataSource
        .getRepository(Organization)
        .countBy({ name: organizationName }),
    ).toBe(0);
  });

  it('validates the register input', async () => {
    await api(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', name: 'x', password: 'short' })
      .expect(400);
  });
});

describe('JWT_SECRET (e2e)', () => {
  // Compiles the real JwtModule configuration of AuthModule, without the
  // database: Nest fails the whole bootstrap when this factory throws.
  const compileJwt = (secret: string) =>
    Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          load: [() => ({ JWT_SECRET: secret, JWT_EXPIRES_IN: '1h' })],
        }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: jwtModuleOptions,
        }),
      ],
    }).compile();

  it('refuses to start with a secret shorter than 32 characters', async () => {
    await expect(compileJwt('x'.repeat(31))).rejects.toThrow(
      'JWT_SECRET must be at least 32 characters',
    );
  });

  it('starts with a 32-character secret', async () => {
    const moduleRef = await compileJwt('x'.repeat(32));
    await moduleRef.close();
  });
});
