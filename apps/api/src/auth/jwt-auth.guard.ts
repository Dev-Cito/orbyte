import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CLS_AUTH } from '../tenancy/tenant-store';
import type { AuthedRequest } from './auth-context';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const auth = await this.authService.verifyBearer(req.headers.authorization);
    if (!auth) throw new UnauthorizedException('Authentication required');
    req.auth = auth;
    // The tenant context for the rest of the request: TenantDatabase reads
    // the organization from here to scope the database transaction.
    this.cls.set(CLS_AUTH, auth);
    return true;
  }
}
