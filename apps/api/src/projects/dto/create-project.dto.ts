import { IsString, Length } from 'class-validator';

// No organizationId here on purpose: it always comes from the token. The
// global ValidationPipe rejects any property not declared in this class.
export class CreateProjectDto {
  @IsString()
  @Length(1, 200)
  name: string;
}
