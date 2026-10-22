import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PlansModule } from '../plans/plans.module';
import { TenancyModule } from '../tenancy/tenancy.module';
import { Project } from './project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  // forFeature only registers the entity: repositories come from
  // TenantDatabase, bound to the request's tenant transaction.
  imports: [
    TypeOrmModule.forFeature([Project]),
    AuthModule,
    TenancyModule,
    PlansModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
