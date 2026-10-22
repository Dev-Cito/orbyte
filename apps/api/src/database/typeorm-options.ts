import type { DataSourceOptions } from 'typeorm';
import { RedactedSqlLogger } from './redacted-sql.logger';

type PostgresOptions = Extract<DataSourceOptions, { type: 'postgres' }>;
type EnvReader = (key: string) => string | undefined;

// Shared by the Nest app (via ConfigService) and the TypeORM CLI data source
// (via process.env), so both connect with exactly the same settings.
export function typeOrmOptions(env: EnvReader): PostgresOptions {
  const url = env('DATABASE_URL');
  if (!url) throw new Error('DATABASE_URL is required');
  const isProduction = env('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    url,
    // UUID defaults use gen_random_uuid(), built into Postgres 13+: no
    // extension to create (managed providers may not allow it), so TypeORM
    // must not try to install one on connect.
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    // Opt-in for local dev only; production never auto-syncs the schema,
    // even if the variable is set by mistake. Migrations are the default.
    synchronize: !isProduction && env('DATABASE_SYNCHRONIZE') === 'true',
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
