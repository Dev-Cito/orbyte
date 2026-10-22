import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthContext, AuthedRequest } from './auth-context';

// The identity set by JwtAuthGuard. Only use behind that guard.
export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const { auth } = context.switchToHttp().getRequest<AuthedRequest>();
    // Fails closed if a handler uses @CurrentAuth without the guard.
    if (!auth) throw new UnauthorizedException('Authentication required');
    return auth;
  },
);
