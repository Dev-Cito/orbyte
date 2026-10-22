import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthedRequest } from './auth-context';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const auth = await this.authService.verifyBearer(req.headers.authorization);
    if (!auth) throw new UnauthorizedException('Authentication required');
    req.auth = auth;
    return true;
  }
}
