import type { DataSourceOptions } from 'typeorm';
import { RedactedSqlLogger } from './redacted-sql.logger';

type PostgresOptions = Extract<DataSourceOptions, { type: 'postgres' }>;
type EnvReader = (key: string) => string | undefined;

// Two connections, two roles:
// - DATABASE_URL: the Nest app at runtime, as orbyte_app (no superuser, no
//   BYPASSRLS, not the owner), so Row-Level Security applies to it.
// - DATABASE_MIGRATION_URL: the TypeORM CLI, the seed and test assertions,
//   as the role that owns the tables.
export type DatabaseUrlKey = 'DATABASE_URL' | 'DATABASE_MIGRATION_URL';

// Shared by the Nest app (via ConfigService) and the owner data source (via
// process.env), so both connect with the same settings except the role.
export function typeOrmOptions(
  env: EnvReader,
  urlKey: DatabaseUrlKey,
): PostgresOptions {
  const url = env(urlKey);
  if (!url) throw new Error(`${urlKey} is required`);
  const isProduction = env('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    url,
    // UUID defaults use gen_random_uuid(), built into Postgres 13+: no
    // extension to create (managed providers may not allow it), so TypeORM
    // must not try to install one on connect.
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    // Never: roles, grants and RLS policies only exist in migrations, which
    // synchronize knows nothing about. The app role has no DDL rights anyway.
    synchronize: false,
    // Verbose in dev so every query (and its tenant filter) is visible.
    // Parameters are never logged: they can hold hashes and emails.
    logger: new RedactedSqlLogger(
      isProduction ? ['error'] : ['query', 'error'],
    ),
    // Managed Postgres providers need SSL with an unverifiable chain;
    // local Docker Postgres has none, so this is opt-in via env.
    ssl: env('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  };
}
