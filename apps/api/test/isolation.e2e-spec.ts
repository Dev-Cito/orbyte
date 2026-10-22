import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { Project } from './../src/projects/project.entity';
import { Task } from './../src/tasks/task.entity';
import {
  api,
  bearer,
  cleanup,
  ownerDb,
  registerTenant,
  startApp,
  Tenant,
} from './helpers';

interface ProjectBody {
  id: string;
  name: string;
  organizationId: string;
}

interface TaskBody {
  id: string;
  projectId: string;
  organizationId: string;
  status: string;
  position: number;
}

// Tenant isolation as enforced by the application today (every query filtered
// on the token's organizationId). These must stay green once Row-Level
// Security is added underneath: RLS hardens the same contract.
describe('Tenant isolation (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let a: Tenant;
  let b: Tenant;
  let projectA: ProjectBody;
  let projectB: ProjectBody;
  let taskB: TaskBody;

  const createProject = async (tenant: Tenant, name: string) =>
    (
      await api(app)
        .post('/projects')
        .set(bearer(tenant))
        .send({ name })
        .expect(201)
    ).body as ProjectBody;

  beforeAll(async () => {
    app = await startApp();
    dataSource = await ownerDb();
    a = await registerTenant(app, 'org-a');
    b = await registerTenant(app, 'org-b');
    projectA = await createProject(a, 'A project 1');
    await createProject(a, 'A project 2');
    projectB = await createProject(b, 'B project 1');
    await createProject(b, 'B project 2');
    taskB = (
      await api(app)
        .post(`/projects/${projectB.id}/tasks`)
        .set(bearer(b))
        .send({ title: 'B task' })
        .expect(201)
    ).body as TaskBody;
  });

  afterAll(async () => {
    await cleanup([a, b]);
    await dataSource.destroy();
    await app.close();
  });

  describe('projects', () => {
    it('a user of org A only lists the projects of org A', async () => {
      const res = await api(app).get('/projects').set(bearer(a)).expect(200);
      const projects = res.body as ProjectBody[];
      expect(projects.map((p) => p.name)).toEqual([
        'A project 1',
        'A project 2',
      ]);
      expect(projects.every((p) => p.organizationId === a.organizationId)).toBe(
        true,
      );
    });

    it('a user of org A can fetch a project of org A by id', async () => {
      const res = await api(app)
        .get(`/projects/${projectA.id}`)
        .set(bearer(a))
        .expect(200);
      expect((res.body as ProjectBody).id).toBe(projectA.id);
    });

    it('fetching a project of org B by its id is a 404, same as an unknown id', async () => {
      const otherOrg = await api(app)
        .get(`/projects/${projectB.id}`)
        .set(bearer(a))
        .expect(404);
      const unknown = await api(app)
        .get(`/projects/${randomUUID()}`)
        .set(bearer(a))
        .expect(404);
      // Indistinguishable: org A cannot even learn that the project exists.
      expect(otherOrg.body).toEqual(unknown.body);
    });

    it('deleting a project of org B is a 404 and leaves it in place', async () => {
      await api(app)
        .delete(`/projects/${projectB.id}`)
        .set(bearer(a))
        .expect(404);
      expect(
        await dataSource.getRepository(Project).existsBy({ id: projectB.id }),
      ).toBe(true);
    });

    it('creating a project puts it in the organization of the token', async () => {
      const created = await createProject(a, 'Created by A');
      expect(created.organizationId).toBe(a.organizationId);
      const stored = await dataSource
        .getRepository(Project)
        .findOneByOrFail({ id: created.id });
      expect(stored.organizationId).toBe(a.organizationId);
    });

    it('rejects an organizationId in the body and creates nothing', async () => {
      const name = `Smuggled ${randomUUID()}`;
      const res = await api(app)
        .post('/projects')
        .set(bearer(a))
        .send({ name, organizationId: b.organizationId })
        .expect(400);
      expect((res.body as { message: string[] }).message).toContain(
        'property organizationId should not exist',
      );
      expect(await dataSource.getRepository(Project).countBy({ name })).toBe(0);
    });

    it('requires a valid token', async () => {
      await api(app).get('/projects').expect(401);
      await api(app)
        .get('/projects')
        .set({ authorization: `Bearer ${a.token}x` })
        .expect(401);
    });
  });

  describe('tasks', () => {
    it('cannot list the tasks of a project of org B', async () => {
      await api(app)
        .get(`/projects/${projectB.id}/tasks`)
        .set(bearer(a))
        .expect(404);
    });

    it('cannot create a task in a project of org B', async () => {
      await api(app)
        .post(`/projects/${projectB.id}/tasks`)
        .set(bearer(a))
        .send({ title: 'Intruder' })
        .expect(404);
      expect(
        await dataSource
          .getRepository(Task)
          .countBy({ projectId: projectB.id, title: 'Intruder' }),
      ).toBe(0);
    });

    it('cannot update or delete a task of org B', async () => {
      await api(app)
        .patch(`/tasks/${taskB.id}`)
        .set(bearer(a))
        .send({ status: 'done' })
        .expect(404);
      await api(app).delete(`/tasks/${taskB.id}`).set(bearer(a)).expect(404);
      const stored = await dataSource
        .getRepository(Task)
        .findOneByOrFail({ id: taskB.id });
      expect(stored.status).toBe('todo');
    });

    it('creates tasks in the organization of the token, appended in order', async () => {
      const create = async (title: string) =>
        (
          await api(app)
            .post(`/projects/${projectA.id}/tasks`)
            .set(bearer(a))
            .send({ title })
            .expect(201)
        ).body as TaskBody;
      const first = await create('First');
      const second = await create('Second');
      expect(first).toMatchObject({
        projectId: projectA.id,
        organizationId: a.organizationId,
        status: 'todo',
        position: 0,
      });
      expect(second.position).toBe(1);

      const list = await api(app)
        .get(`/projects/${projectA.id}/tasks`)
        .set(bearer(a))
        .expect(200);
      expect((list.body as TaskBody[]).map((t) => t.id)).toEqual([
        first.id,
        second.id,
      ]);
    });

    it('rejects organizationId or projectId in a task body', async () => {
      await api(app)
        .post(`/projects/${projectA.id}/tasks`)
        .set(bearer(a))
        .send({ title: 'x', organizationId: b.organizationId })
        .expect(400);
      await api(app)
        .post(`/projects/${projectA.id}/tasks`)
        .set(bearer(a))
        .send({ title: 'x', projectId: projectB.id })
        .expect(400);
    });

    it('updates status and position of its own tasks, then deletes them', async () => {
      const task = (
        await api(app)
          .post(`/projects/${projectA.id}/tasks`)
          .set(bearer(a))
          .send({ title: 'Move me' })
          .expect(201)
      ).body as TaskBody;
      const updated = await api(app)
        .patch(`/tasks/${task.id}`)
        .set(bearer(a))
        .send({ status: 'in_progress', position: 7 })
        .expect(200);
      expect(updated.body).toMatchObject({
        status: 'in_progress',
        position: 7,
      });
      await api(app)
        .patch(`/tasks/${task.id}`)
        .set(bearer(a))
        .send({ status: 'archived' })
        .expect(400);
      await api(app).delete(`/tasks/${task.id}`).set(bearer(a)).expect(204);
      await api(app).delete(`/tasks/${task.id}`).set(bearer(a)).expect(404);
    });

    it('the database refuses a task whose organization differs from its project', async () => {
      // Bypasses the application on purpose: the composite foreign key on
      // (projectId, organizationId) is the last line of defence.
      await expect(
        dataSource.getRepository(Task).insert({
          projectId: projectB.id,
          organizationId: a.organizationId,
          title: 'Cross-tenant',
        }),
      ).rejects.toThrow(/foreign key constraint/);
    });
  });
});
