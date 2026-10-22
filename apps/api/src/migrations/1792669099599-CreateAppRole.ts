import { MigrationInterface, QueryRunner } from 'typeorm';

// The runtime role. Row-Level Security is ignored by superusers, by roles with
// BYPASSRLS and (without FORCE) by the tables' owner, so the application must
// connect as a role that is none of these. The migration role keeps owning
// the tables and stays the only one allowed to change the schema.
//
// Created NOLOGIN: no password lives in a versioned file. Login is enabled
// out of band with the password from DATABASE_URL (pnpm db:app-login).
export class CreateAppRole1792669099599 implements MigrationInterface {
  name = 'CreateAppRole1792669099599';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Roles are cluster-wide: it may already exist (another database, or a
    // re-run after a revert that could not drop it).
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orbyte_app') THEN
          CREATE ROLE orbyte_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
        END IF;
      END
      $$`);
    await queryRunner.query(`
      DO $$
      BEGIN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO orbyte_app', current_database());
      END
      $$`);
    // USAGE only: no CREATE, the app cannot change the schema.
    await queryRunner.query(`GRANT USAGE ON SCHEMA public TO orbyte_app`);
    // Least privilege, table by table. A future table gets its grants in its
    // own migration (no ALTER DEFAULT PRIVILEGES): forgetting one fails loudly
    // with "permission denied" instead of silently over-granting.
    // No DELETE on users and organizations: nothing deletes them yet.
    await queryRunner.query(
      `GRANT SELECT, INSERT, UPDATE ON "user", "organization" TO orbyte_app`,
    );
    await queryRunner.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON "membership", "project", "task" TO orbyte_app`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `REVOKE ALL ON "user", "organization", "membership", "project", "task" FROM orbyte_app`,
    );
    await queryRunner.query(`REVOKE USAGE ON SCHEMA public FROM orbyte_app`);
    await queryRunner.query(`
      DO $$
      BEGIN
        EXECUTE format('REVOKE CONNECT ON DATABASE %I FROM orbyte_app', current_database());
      END
      $$`);
    await queryRunner.query(`DROP ROLE IF EXISTS orbyte_app`);
  }
}
