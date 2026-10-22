import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, lastValueFrom, Observable } from 'rxjs';
import { TenantDatabase } from './tenant-database';

// Wraps the whole handler in one tenant transaction: it commits when the
// handler resolves and rolls back when it throws (HTTP exceptions included).
// Runs after the guards, so the token's organization is already in CLS.
@Injectable()
export class TenantTransactionInterceptor implements NestInterceptor {
  constructor(private readonly tenantDb: TenantDatabase) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return from(
      this.tenantDb.runInTenantTransaction(() =>
        lastValueFrom(next.handle(), { defaultValue: undefined }),
      ),
    );
  }
}
