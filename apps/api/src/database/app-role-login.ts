import type { DataSource } from 'typeorm';
import ownerDataSource from './data-source';

// The migration creates orbyte_app with NOLOGIN, so no password is ever
// versioned. This enables login with the user and password of DATABASE_URL,
// connected as the owner: DATABASE_URL stays the single source of truth.
// Re-run it after rotating the password.
export async function enableAppRoleLogin(owner: DataSource): Promise<string> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const { username, password } = new URL(url);
  const role = decodeURIComponent(username);
  if (!password) throw new Error('DATABASE_URL has no password');

  const [{ exists }] = await owner.query<{ exists: boolean }[]>(
    'SELECT EXISTS (SELECT FROM pg_roles WHERE rolname = $1) AS "exists"',
    [role],
  );
  if (!exists) {
    throw new Error(`Role ${role} does not exist: run the migrations first`);
  }
  // ALTER ROLE takes no bind parameters: quote both by hand.
  // standard_conforming_strings is on (the default since Postgres 9.1), so
  // doubling quotes is a complete escape for the literal.
  const identifier = `"${role.replace(/"/g, '""')}"`;
  const literal = `'${decodeURIComponent(password).replace(/'/g, "''")}'`;
  await owner.query(`ALTER ROLE ${identifier} WITH LOGIN PASSWORD ${literal}`);
  return role;
}

if (require.main === module) {
  (async () => {
    await ownerDataSource.initialize();
    try {
      const role = await enableAppRoleLogin(ownerDataSource);
      console.log(`Login enabled for ${role}.`);
    } finally {
      await ownerDataSource.destroy();
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
