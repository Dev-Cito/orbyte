import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { typeOrmOptions } from './typeorm-options';

// Entry point for the TypeORM CLI (migration:generate / run / revert) and the
// e2e global setup. The Nest app does not use it: it goes through AppModule.
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource({
  ...typeOrmOptions((key) => process.env[key]),
  // The CLI must never touch the schema on its own.
  synchronize: false,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
