import { enableAppRoleLogin } from '../src/database/app-role-login';
import dataSource from '../src/database/data-source';

// As the owner: brings the schema (roles and RLS included) up to date, then
// lets the app role log in with the DATABASE_URL password.
export default async function globalSetup() {
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();
    await enableAppRoleLogin(dataSource);
  } finally {
    await dataSource.destroy();
  }
}
