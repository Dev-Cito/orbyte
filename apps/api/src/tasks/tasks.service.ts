import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

// Same rule as projects: every query is scoped with the organizationId of the
// verified token, and anything outside it is a 404.
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    organizationId: string,
    projectId: string,
    input: CreateTaskDto,
  ): Promise<Task> {
    // 404 unless the project belongs to the caller's organization.
    const project = await this.projectsService.findOne(
      organizationId,
      projectId,
    );
    const position =
      input.position ?? (await this.nextPosition(organizationId, project.id));
    return this.tasks.save(
      this.tasks.create({
        projectId: project.id,
        organizationId,
        title: input.title.trim(),
        status: input.status,
        position,
      }),
    );
  }

  async findByProject(
    organizationId: string,
    projectId: string,
  ): Promise<Task[]> {
    await this.projectsService.findOne(organizationId, projectId);
    return this.tasks.find({
      where: { organizationId, projectId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(organizationId, id);
    if (input.status !== undefined) task.status = input.status;
    if (input.position !== undefined) task.position = input.position;
    return this.tasks.save(task);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const { affected } = await this.tasks.delete({ id, organizationId });
    if (!affected) throw new NotFoundException('Task not found');
  }

  private async findOne(organizationId: string, id: string): Promise<Task> {
    const task = await this.tasks.findOneBy({ id, organizationId });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private async nextPosition(
    organizationId: string,
    projectId: string,
  ): Promise<number> {
    const max = await this.tasks.maximum('position', {
      organizationId,
      projectId,
    });
    return max === null ? 0 : max + 1;
  }
}
