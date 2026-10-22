import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { Task } from '../tasks/task.entity';

@Entity()
// Redundant with the primary key on its own, but it lets Task reference
// (projectId, organizationId) as a pair, so the database guarantees a task's
// denormalized organizationId always matches its project's.
@Unique('UQ_project_id_organization', ['id', 'organizationId'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  organizationId: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Organization, (org) => org.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Relation<Organization>;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Relation<Task[]>;
}
