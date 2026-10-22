import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import type {
  DataSource,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import type { AuthContext } from '../auth/auth-context';
import { CLS_AUTH, CLS_TENANT_MANAGER } from './tenant-store';

// The only way business code reaches tenant tables (project, task).
//
// runInTenantTransaction opens a transaction and sets app.current_org for it
// alone, from the organization of the token (held in CLS). Every repository
// handed out afterwards is bound to that transaction's connection, so every
// query of the request runs under the RLS policies with the right tenant.
@Injectable()
export class TenantDatabase {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  async runInTenantTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.cls.get<EntityManager | undefined>(CLS_TENANT_MANAGER)) {
      throw new Error('A tenant transaction is already open for this request');
    }
    const organizationId = this.cls.get<AuthContext | undefined>(
      CLS_AUTH,
    )?.organizationId;
    // Fail closed: no tenant, no transaction (the RLS would show nothing
    // anyway, but a missing guard is a bug worth surfacing).
    if (!organizationId) throw new Error('No tenant in context');

    return this.dataSource.transaction(async (manager) => {
      // set_config(name, value, is_local => true) is SET LOCAL as a function:
      // same semantics (reset at COMMIT/ROLLBACK, so it can never leak to the
      // next user of this pooled connection), but it takes a bind parameter,
      // where SET LOCAL would need the value spliced into the SQL.
      await manager.query(`SELECT set_config('app.current_org', $1, true)`, [
        organizationId,
      ]);
      this.cls.set(CLS_TENANT_MANAGER, manager);
      try {
        return await work();
      } finally {
        this.cls.set(CLS_TENANT_MANAGER, undefined);
      }
    });
  }

  // Throws outside runInTenantTransaction, so a route that forgot the tenant
  // interceptor errors out instead of querying on an unscoped connection.
  get manager(): EntityManager {
    const manager = this.cls.get<EntityManager | undefined>(CLS_TENANT_MANAGER);
    if (!manager) {
      throw new Error(
        'No tenant transaction: is the route decorated with @TenantRoute()?',
      );
    }
    return manager;
  }

  getRepository<E extends ObjectLiteral>(
    target: EntityTarget<E>,
  ): Repository<E> {
    return this.manager.getRepository(target);
  }
}
