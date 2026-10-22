import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';

export const ROLES = ['owner', 'admin', 'member'] as const;
export type Role = (typeof ROLES)[number];

@Entity()
// A user belongs to an organization at most once. The unique index also
// serves lookups by userId (its leading column).
@Unique('UQ_membership_user_organization', ['userId', 'organizationId'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Index()
  @Column('uuid')
  organizationId: string;

  @Column({ type: 'enum', enum: ROLES, enumName: 'membership_role' })
  role: Role;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @ManyToOne(() => Organization, (org) => org.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Relation<Organization>;
}
