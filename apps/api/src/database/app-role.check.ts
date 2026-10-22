import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

// RLS is silently inert for superusers and BYPASSRLS roles. Refuse to start
// if DATABASE_URL points at one (typically the owner URL pasted by mistake),
// rather than serve requests with only the application filter.
@Injectable()
export class AppRoleCheck implements OnModuleInit {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const [role] = await this.dataSource.query<
      { name: string; rolsuper: boolean; rolbypassrls: boolean }[]
    >(
      'SELECT rolname AS name, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user',
    );
    if (role.rolsuper || role.rolbypassrls) {
      throw new Error(
        `DATABASE_URL connects as "${role.name}", which bypasses Row-Level ` +
          'Security (superuser or BYPASSRLS). Use the app role (orbyte_app); ' +
          'the owner role belongs in DATABASE_MIGRATION_URL.',
      );
    }
  }
}
