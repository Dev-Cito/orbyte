import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { Project } from '../projects/project.entity';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

@Entity()
// Tasks are listed per project, ordered by position.
@Index(['projectId', 'position'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  // Deliberately denormalized from the project: the future RLS policies can
  // then filter tasks on their own column, without a join.
  @Index()
  @Column('uuid')
  organizationId: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: TASK_STATUSES,
    enumName: 'task_status',
    default: 'todo',
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Composite FK onto Project (id, organizationId): a task can never point at
  // a project of another organization, whatever the application code does.
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'projectId', referencedColumnName: 'id' },
    { name: 'organizationId', referencedColumnName: 'organizationId' },
  ])
  project: Relation<Project>;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Relation<Organization>;
}
