import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../auth/auth-context';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  create(
    @CurrentAuth() auth: AuthContext,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() input: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(auth.organizationId, projectId, input);
  }

  @Get('projects/:projectId/tasks')
  findByProject(
    @CurrentAuth() auth: AuthContext,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<Task[]> {
    return this.tasksService.findByProject(auth.organizationId, projectId);
  }

  @Patch('tasks/:id')
  update(
    @CurrentAuth() auth: AuthContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(auth.organizationId, id, input);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentAuth() auth: AuthContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.tasksService.remove(auth.organizationId, id);
  }
}
