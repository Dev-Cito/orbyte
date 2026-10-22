import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmOptions } from './database/typeorm-options';
import { MembershipsModule } from './memberships/memberships.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...typeOrmOptions((key) => config.get<string>(key)),
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
  providers: [
    // Registered here rather than in main.ts so e2e tests get it too.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // Undeclared properties (e.g. organizationId in a body) are a 400,
        // not silently dropped: the client learns it cannot pick its tenant.
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
