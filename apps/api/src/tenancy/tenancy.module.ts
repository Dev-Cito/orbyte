import { Module } from '@nestjs/common';
import { TenantDatabase } from './tenant-database';
import { TenantTransactionInterceptor } from './tenant-transaction.interceptor';

@Module({
  providers: [TenantDatabase, TenantTransactionInterceptor],
  exports: [TenantDatabase, TenantTransactionInterceptor],
})
export class TenancyModule {}
