import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TASK_STATUSES, type TaskStatus } from '../task.entity';

// No projectId (it is in the URL) and no organizationId (it comes from the
// token). Unknown properties are rejected by the global ValidationPipe.
export class CreateTaskDto {
  @IsString()
  @Length(1, 500)
  title: string;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  // Defaults to the end of the project's list.
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
