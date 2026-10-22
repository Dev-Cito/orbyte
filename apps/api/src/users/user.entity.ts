import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Membership } from '../memberships/membership.entity';

// Named so AuthService can tell "email taken" apart from other conflicts.
export const USER_EMAIL_UNIQUE = 'UQ_user_email';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index(USER_EMAIL_UNIQUE, { unique: true })
  @Column()
  email: string;

  // Never expose this. select: false keeps it out of every query unless it is
  // explicitly asked for (login only).
  @Column({ select: false })
  passwordHash: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Relation<Membership[]>;
}
