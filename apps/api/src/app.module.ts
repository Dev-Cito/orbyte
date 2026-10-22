import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { AppRoleCheck } from './database/app-role.check';
import { typeOrmOptions } from './database/typeorm-options';
import { MembershipsModule } from './memberships/memberships.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { StripeModule } from './stripe/stripe.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // One CLS context per HTTP request, opened by a middleware on every route.
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // The app role: subject to Row-Level Security.
        ...typeOrmOptions((key) => config.get<string>(key), 'DATABASE_URL'),
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    StripeModule,
    BillingModule,
  ],
  providers: [
    AppRoleCheck,
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
