import dataSource from '../src/database/data-source';

// Brings the database schema up to date before any suite boots the app.
export default async function globalSetup() {
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
}
