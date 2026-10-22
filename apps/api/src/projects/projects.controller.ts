import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import type { AuthContext } from '../auth/auth-context';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { TenantRoute } from '../tenancy/tenant-route.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
@TenantRoute()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @CurrentAuth() auth: AuthContext,
    @Body() input: CreateProjectDto,
  ): Promise<Project> {
    return this.projectsService.create(auth.organizationId, input.name);
  }

  @Get()
  findAll(@CurrentAuth() auth: AuthContext): Promise<Project[]> {
    return this.projectsService.findAll(auth.organizationId);
  }

  @Get(':id')
  findOne(
    @CurrentAuth() auth: AuthContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Project> {
    return this.projectsService.findOne(auth.organizationId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentAuth() auth: AuthContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.projectsService.remove(auth.organizationId, id);
  }
}
