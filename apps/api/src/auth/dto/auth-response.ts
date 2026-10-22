import type { Role } from '../../memberships/membership.entity';
import type {
  Organization,
  Plan,
} from '../../organizations/organization.entity';
import type { User } from '../../users/user.entity';

// Explicit response shapes: entities are never serialized as-is, so a new
// column (or passwordHash) cannot leak by accident.
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface PublicOrganization {
  id: string;
  name: string;
  plan: Plan;
  createdAt: Date;
}

export interface MeResponse {
  user: PublicUser;
  organization: PublicOrganization;
  role: Role;
}

export interface AuthResponse extends MeResponse {
  token: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export function toPublicOrganization(org: Organization): PublicOrganization {
  return {
    id: org.id,
    name: org.name,
    plan: org.plan,
    createdAt: org.createdAt,
  };
}
