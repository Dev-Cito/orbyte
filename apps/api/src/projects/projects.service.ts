import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlanUsageService } from '../plans/plan-usage.service';
import { TenantDatabase } from '../tenancy/tenant-database';
import { Project } from './project.entity';

// Two layers of tenant isolation. Every query is still scoped with the
// organizationId of the verified token (application filter), and runs in the
// request's tenant transaction, where Row-Level Security only lets the rows
// of that same organization through (database filter).
@Injectable()
export class ProjectsService {
  constructor(
    private readonly tenantDb: TenantDatabase,
    private readonly planUsage: PlanUsageService,
  ) {}

  // Bound to the current request's tenant transaction.
  private get projects(): Repository<Project> {
    return this.tenantDb.getRepository(Project);
  }

  async create(organizationId: string, name: string): Promise<Project> {
    // Same tenant transaction as the insert: the plan check holds its lock
    // until this insert is committed.
    await this.planUsage.assertCanCreateProject(organizationId);
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
