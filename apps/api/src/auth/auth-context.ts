import type { Request } from 'express';
import type { Role } from '../memberships/membership.entity';

// What the JWT carries: the user and their ACTIVE organization. A user has a
// single organization for now; the token is already shaped for several.
export interface JwtPayload {
  sub: string;
  org: string;
  role: Role;
}

// The verified identity of a request, set by JwtAuthGuard. Every tenant
// filter reads organizationId from here, never from the request body.
export interface AuthContext {
  userId: string;
  organizationId: string;
  role: Role;
}

export type AuthedRequest = Request & { auth?: AuthContext };
