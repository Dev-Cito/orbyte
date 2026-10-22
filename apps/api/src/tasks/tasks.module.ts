import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  // forFeature only registers the entity: repositories come from
  // TenantDatabase, bound to the request's tenant transaction.
  imports: [
    TypeOrmModule.forFeature([Task]),
    AuthModule,
    ProjectsModule,
    TenancyModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
