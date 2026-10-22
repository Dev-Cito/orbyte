// Keys of the per-request state held by nestjs-cls (AsyncLocalStorage): it
// lives for one HTTP request and is invisible to every other request.
// (Plain keys rather than a typed ClsStore: nestjs-cls's recursive key typing
// does not terminate on TypeORM's EntityManager.)

// AuthContext, set by JwtAuthGuard from the verified token.
export const CLS_AUTH = 'auth';
// EntityManager, set by TenantDatabase for the tenant transaction's duration.
export const CLS_TENANT_MANAGER = 'tenantManager';
