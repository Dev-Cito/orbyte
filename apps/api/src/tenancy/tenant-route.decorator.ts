import { applyDecorators, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantTransactionInterceptor } from './tenant-transaction.interceptor';

// For controllers that touch tenant data: authenticates the request (the
// guard puts the token's organization in CLS), then runs the handler inside a
// transaction scoped to that organization.
export function TenantRoute() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    UseInterceptors(TenantTransactionInterceptor),
  );
}
