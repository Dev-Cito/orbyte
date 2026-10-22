import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { TASK_STATUSES, type TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
