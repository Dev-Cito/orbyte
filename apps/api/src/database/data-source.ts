import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { typeOrmOptions } from './typeorm-options';

// Owner connection (DATABASE_MIGRATION_URL), for the TypeORM CLI
// (migration:generate / run / revert), the seed, db:app-login and the e2e
// setup. The Nest app never uses it: it connects as orbyte_app via AppModule.
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource({
  ...typeOrmOptions((key) => process.env[key], 'DATABASE_MIGRATION_URL'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
