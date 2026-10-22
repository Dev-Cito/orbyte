import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppRoleCheck } from './../src/database/app-role.check';
import {
  api,
  bearer,
  cleanup,
  ownerDb,
  registerTenant,
  startApp,
  Tenant,
} from './helpers';

const countProjects = 'SELECT count(*)::int AS n FROM project';

// The Row-Level Security plumbing: the app's role, the table flags, and what
// app.current_org does to visibility. (Proving that RLS alone stops a leak
// with the application filter removed is the next step, not this suite.)
describe('Row-Level Security infrastructure (e2e)', () => {
  let app: INestApplication;
  let appDb: DataSource;
  let owner: DataSource;
  let a: Tenant;
  let b: Tenant;

  beforeAll(async () => {
    app = await startApp();
    appDb = app.get(DataSource);
    owner = await ownerDb();
    a = await registerTenant(app, 'rls-a');
    b = await registerTenant(app, 'rls-b');
    for (const [tenant, name] of [
      [a, 'A1'],
      [a, 'A2'],
      [b, 'B1'],
    ] as const) {
      await api(app)
        .post('/projects')
        .set(bearer(tenant))
        .send({ name })
        .expect(201);
    }
  });

  afterAll(async () => {
    await cleanup([a, b]);
    await owner.destroy();
    await app.close();
  });

  it('the app connects as orbyte_app, which cannot bypass RLS', async () => {
    const [role] = await appDb.query<
      { name: string; rolsuper: boolean; rolbypassrls: boolean }[]
    >(
      'SELECT rolname AS name, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user',
    );
    expect(role).toEqual({
      name: 'orbyte_app',
      rolsuper: false,
      rolbypassrls: false,
    });
  });

  it('the app role owns none of the tables', async () => {
    const owned = await appDb.query<unknown[]>(
      `SELECT tablename FROM pg_tables
       WHERE schemaname = 'public' AND tableowner = current_user`,
    );
    expect(owned).toEqual([]);
  });

  it('refuses to start as a role that bypasses RLS', async () => {
    // The local owner is a superuser: exactly the misconfiguration to catch.
    await expect(new AppRoleCheck(owner).onModuleInit()).rejects.toThrow(
      /bypasses Row-Level Security/,
    );
  });

  it('project and task have RLS enabled and forced, with a tenant policy', async () => {
    const tables = await owner.query<unknown[]>(
      `SELECT c.relname AS table, c.relrowsecurity AS enabled,
              c.relforcerowsecurity AS forced, p.polname AS policy
       FROM pg_class c
       LEFT JOIN pg_policy p ON p.polrelid = c.oid
       WHERE c.relname IN ('project', 'task')
       ORDER BY c.relname`,
    );
    expect(tables).toEqual([
      {
        table: 'project',
        enabled: true,
        forced: true,
        policy: 'tenant_isolation',
      },
      {
        table: 'task',
        enabled: true,
        forced: true,
        policy: 'tenant_isolation',
      },
    ]);
  });

  it('without app.current_org, the app role sees no row at all', async () => {
    const [{ n: total }] = await owner.query<{ n: number }[]>(countProjects);
    const [{ n: visible }] = await appDb.query<{ n: number }[]>(countProjects);
    expect(total).toBeGreaterThanOrEqual(3);
    expect(visible).toBe(0);
  });

  it('a transaction-local app.current_org shows that tenant only, then vanishes at COMMIT', async () => {
    // One connection throughout, as a pooled connection would be reused.
    const runner = appDb.createQueryRunner();
    await runner.connect();
    try {
      await runner.startTransaction();
      await runner.query(`SELECT set_config('app.current_org', $1, true)`, [
        a.organizationId,
      ]);
      // QueryRunner.query is untyped (any), unlike DataSource.query.
      const rows = (await runner.query(
        'SELECT "organizationId" FROM project',
      )) as { organizationId: string }[];
      await runner.commitTransaction();
      expect(rows.length).toBeGreaterThanOrEqual(2);
      expect(rows.every((r) => r.organizationId === a.organizationId)).toBe(
        true,
      );

      // Same connection, after COMMIT: the setting reads '' now (not NULL).
      // The policy must treat it as "no tenant" (no row), not crash on ''::uuid.
      const [{ setting }] = (await runner.query(
        `SELECT current_setting('app.current_org', true) AS setting`,
      )) as { setting: string | null }[];
      expect(setting).toBe('');
      const [{ n }] = (await runner.query(countProjects)) as { n: number }[];
      expect(n).toBe(0);
    } finally {
      await runner.release();
    }
  });

  it('WITH CHECK refuses to write a row for another tenant', async () => {
    const runner = appDb.createQueryRunner();
    await runner.connect();
    try {
      await runner.startTransaction();
      await runner.query(`SELECT set_config('app.current_org', $1, true)`, [
        a.organizationId,
      ]);
      await expect(
        runner.query(
          `INSERT INTO project ("organizationId", name) VALUES ($1, 'Forged')`,
          [b.organizationId],
        ),
      ).rejects.toThrow(/row-level security policy/);
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  });
});
