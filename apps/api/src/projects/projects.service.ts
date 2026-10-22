import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

// Tenant isolation is applicative for now: every query is scoped with
// organizationId, which callers take from the verified token. Row-Level
// Security will back this up at the database level.
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  create(organizationId: string, name: string): Promise<Project> {
    return this.projects.save(
      this.projects.create({ organizationId, name: name.trim() }),
    );
  }

  findAll(organizationId: string): Promise<Project[]> {
    return this.projects.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });
  }

  // A project of another organization is reported as missing (404), not
  // forbidden (403): its existence is none of the caller's business.
  async findOne(organizationId: string, id: string): Promise<Project> {
    const project = await this.projects.findOneBy({ id, organizationId });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    // Tasks go with it (ON DELETE CASCADE).
    const { affected } = await this.projects.delete({ id, organizationId });
    if (!affected) throw new NotFoundException('Project not found');
  }
}
