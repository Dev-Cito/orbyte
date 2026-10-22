import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Membership } from '../memberships/membership.entity';
import { Organization } from '../organizations/organization.entity';
import { User, USER_EMAIL_UNIQUE } from '../users/user.entity';
import type { AuthContext, JwtPayload } from './auth-context';
import {
  AuthResponse,
  MeResponse,
  toPublicOrganization,
  toPublicUser,
} from './dto/auth-response';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AuthService {
  // Verified against when the email is unknown, so a login attempt costs the
  // same time whether or not the account exists.
  private dummyHash?: Promise<string>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    private readonly jwtService: JwtService,
  ) {}

  // Creates the organization, its owner and the membership linking them in a
  // single transaction: either all three exist afterwards, or none does.
  async register(input: RegisterDto): Promise<AuthResponse> {
    const email = normalizeEmail(input.email);
    // Hashed before opening the transaction: argon2 is slow on purpose and
    // must not hold a connection and its locks while it runs.
    const passwordHash = await hashPassword(input.password);

    let user: User;
    let organization: Organization;
    let membership: Membership;
    try {
      ({ user, organization, membership } = await this.dataSource.transaction(
        async (manager) => {
          const organization = await manager.save(
            manager.create(Organization, {
              name: input.organizationName.trim(),
              plan: 'free',
            }),
          );
          // The unique index on email is the source of truth for duplicates
          // (no check-then-insert race). If it fires, the organization above
          // is rolled back with the rest.
          const user = await manager.save(
            manager.create(User, {
              email,
              name: input.name.trim(),
              passwordHash,
            }),
          );
          const membership = await manager.save(
            manager.create(Membership, {
              userId: user.id,
              organizationId: organization.id,
              role: 'owner',
            }),
          );
          return { user, organization, membership };
        },
      ));
    } catch (err) {
      // Deliberate trade-off (same as Baraza): an explicit message is better
      // UX, at the cost of letting anyone check whether an email has an
      // account. login stays generic and constant-time.
      if (isUniqueViolation(err, USER_EMAIL_UNIQUE)) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }

    return {
      token: await this.sign(membership),
      user: toPublicUser(user),
      organization: toPublicOrganization(organization),
      role: membership.role,
    };
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: normalizeEmail(input.email) })
      .getOne();
    if (!user) {
      this.dummyHash ??= hashPassword('dummy-password-for-timing');
      await verifyPassword(await this.dummyHash, input.password);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await verifyPassword(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // One organization per user for now: the active one is the first joined.
    // Multi-org will let the client pick (and switch) instead.
    const membership = await this.memberships.findOne({
      where: { userId: user.id },
      relations: { organization: true },
      order: { createdAt: 'ASC' },
    });
    // Only reachable with the right password, so this leaks nothing.
    if (!membership) throw new ForbiddenException('User has no organization');

    return {
      token: await this.sign(membership),
      user: toPublicUser(user),
      organization: toPublicOrganization(membership.organization),
      role: membership.role,
    };
  }

  async me(auth: AuthContext): Promise<MeResponse> {
    const membership = await this.memberships.findOne({
      where: { userId: auth.userId, organizationId: auth.organizationId },
      relations: { user: true, organization: true },
    });
    // The guard just checked it; only a concurrent removal gets here.
    if (!membership) throw new NotFoundException();
    return {
      user: toPublicUser(membership.user),
      organization: toPublicOrganization(membership.organization),
      role: membership.role,
    };
  }

  // Resolves an "Authorization: Bearer <jwt>" value to its identity. Returns
  // null for anything missing, malformed or expired, and for a membership
  // that no longer exists: removing someone from an organization revokes
  // their tokens for it at once. The role is read from the membership, not
  // the token, so a role change also applies immediately.
  async verifyBearer(authorization: unknown): Promise<AuthContext | null> {
    if (typeof authorization !== 'string') return null;
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
    const { sub, org } = payload;
    if (!isUuid(sub) || !isUuid(org)) return null;

    const membership = await this.memberships.findOneBy({
      userId: sub,
      organizationId: org,
    });
    if (!membership) return null;
    return { userId: sub, organizationId: org, role: membership.role };
  }

  private sign(membership: Membership): Promise<string> {
    return this.jwtService.signAsync({
      sub: membership.userId,
      org: membership.organizationId,
      role: membership.role,
    } satisfies JwtPayload);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guards the membership query against a (validly signed) token whose claims
// are not UUIDs, which Postgres would reject with a 500.
function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

function isUniqueViolation(err: unknown, constraint: string): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string; constraint?: string };
  return driverError.code === '23505' && driverError.constraint === constraint;
}
