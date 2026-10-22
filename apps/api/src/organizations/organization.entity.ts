import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Membership } from '../memberships/membership.entity';
import { Project } from '../projects/project.entity';

export const PLANS = ['free', 'pro', 'business'] as const;
export type Plan = (typeof PLANS)[number];

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PLANS,
    enumName: 'organization_plan',
    default: 'free',
  })
  plan: Plan;

  // Billing fields, filled in once Stripe is wired up.
  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId: string | null;

  // Mirrors Stripe's subscription status (active, past_due, ...). Kept as a
  // plain string so a new Stripe status never breaks the column.
  @Column({ type: 'varchar', nullable: true })
  subscriptionStatus: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Membership, (membership) => membership.organization)
  memberships: Relation<Membership[]>;

  @OneToMany(() => Project, (project) => project.organization)
  projects: Relation<Project[]>;
}
