import { MigrationInterface, QueryRunner } from 'typeorm';

const TENANT_TABLES = ['project', 'task'];

// Second isolation layer, under the application's WHERE "organizationId" = ...
// Each business transaction sets app.current_org with SET LOCAL semantics
// (see TenantDatabase); these policies only let through the rows of that
// organization.
export class EnableRowLevelSecurity1792669099600 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1792669099600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The tenant of the current transaction, or NULL when none is set.
    // current_setting(..., true) returns NULL for a variable never set in the
    // session, but '' once a SET LOCAL has ended on that (pooled) connection:
    // NULLIF maps both to NULL. "organizationId" = NULL is never true, so no
    // context means no row at all (deny by default), never every row.
    // Schema-qualified so a lookalike function cannot be slipped in through
    // the search_path. Plain SQL + STABLE lets the planner inline it.
    await queryRunner.query(`
      CREATE FUNCTION app_current_org() RETURNS uuid
        LANGUAGE sql STABLE
        AS $$ SELECT NULLIF(pg_catalog.current_setting('app.current_org', true), '')::uuid $$`);

    for (const table of TENANT_TABLES) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`,
      );
      // FORCE: the owner is subject to RLS too (superusers and BYPASSRLS
      // roles still are not). Since the policy below only targets
      // orbyte_app, an owner that is not a superuser sees and writes
      // nothing: connecting the app as the owner by mistake fails loudly
      // instead of silently bypassing the isolation.
      await queryRunner.query(
        `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`,
      );
      // USING filters what is read, updated and deleted; WITH CHECK rejects
      // inserting a row (or moving one by UPDATE) outside the current tenant.
      await queryRunner.query(`
        CREATE POLICY tenant_isolation ON "${table}"
          AS PERMISSIVE FOR ALL TO orbyte_app
          USING ("organizationId" = app_current_org())
          WITH CHECK ("organizationId" = app_current_org())`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [...TENANT_TABLES].reverse()) {
      await queryRunner.query(`DROP POLICY tenant_isolation ON "${table}"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`,
      );
    }
    await queryRunner.query(`DROP FUNCTION app_current_org()`);
  }
}
