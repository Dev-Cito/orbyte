import { hashPassword } from './auth/password';
import dataSource from './database/data-source';
import { Membership } from './memberships/membership.entity';
import { Organization } from './organizations/organization.entity';
import { Project } from './projects/project.entity';
import { Task, type TaskStatus } from './tasks/task.entity';
import { User } from './users/user.entity';

// Every seeded user can log in with this password (dev only).
const SEED_PASSWORD = 'password123';

// Two distinct tenants, used to check isolation by hand: log in as one owner
// and try to reach the other organization's projects and tasks.
const ORGS: {
  name: string;
  owner: { name: string; email: string };
  projects: { name: string; tasks: [string, TaskStatus][] }[];
}[] = [
  {
    name: 'Acme (org A)',
    owner: { name: 'Alice Owner', email: 'alice@acme.test' },
    projects: [
      {
        name: 'Website redesign',
        tasks: [
          ['Audit current pages', 'done'],
          ['Wireframes', 'in_progress'],
          ['Pick a font pairing', 'todo'],
        ],
      },
      {
        name: 'Mobile app',
        tasks: [
          ['Set up CI', 'todo'],
          ['Login screen', 'todo'],
        ],
      },
      { name: 'Q3 hiring', tasks: [['Write job post', 'in_progress']] },
    ],
  },
  {
    name: 'Globex (org B)',
    owner: { name: 'Bob Owner', email: 'bob@globex.test' },
    projects: [
      {
        name: 'Data migration',
        tasks: [
          ['Inventory legacy tables', 'done'],
          ['Write migration scripts', 'in_progress'],
          ['Dry run on staging', 'todo'],
        ],
      },
      {
        name: 'Customer portal',
        tasks: [
          ['Define MVP scope', 'todo'],
          ['Invoice page', 'todo'],
        ],
      },
    ],
  },
];

async function seed() {
  // As the owner (DATABASE_MIGRATION_URL): TRUNCATE needs it, and the app
  // role could only write inside one tenant per transaction. Local Docker's
  // owner is a superuser, which Row-Level Security does not apply to; seeding
  // as a non-superuser owner would be refused by FORCE ROW LEVEL SECURITY.
  await dataSource.initialize();

  // Start from a clean slate so the seed can be re-run.
  await dataSource.query(
    'TRUNCATE "task", "project", "membership", "organization", "user" CASCADE',
  );

  const passwordHash = await hashPassword(SEED_PASSWORD);
  await dataSource.transaction(async (manager) => {
    for (const org of ORGS) {
      const organization = await manager.save(
        manager.create(Organization, { name: org.name, plan: 'free' }),
      );
      const user = await manager.save(
        manager.create(User, { ...org.owner, passwordHash }),
      );
      await manager.save(
        manager.create(Membership, {
          userId: user.id,
          organizationId: organization.id,
          role: 'owner',
        }),
      );
      for (const p of org.projects) {
        const project = await manager.save(
          manager.create(Project, {
            name: p.name,
            organizationId: organization.id,
          }),
        );
        await manager.save(
          p.tasks.map(([title, status], position) =>
            manager.create(Task, {
              title,
              status,
              position,
              projectId: project.id,
              organizationId: organization.id,
            }),
          ),
        );
      }
      console.log(
        `${org.name}: owner ${org.owner.email}, ${org.projects.length} projects`,
      );
    }
  });

  console.log(`Seeded. Password for every user: ${SEED_PASSWORD}`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
