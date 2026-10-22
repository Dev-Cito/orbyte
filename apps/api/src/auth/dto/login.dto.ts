import { IsString, MaxLength } from 'class-validator';

// No format rules here: login must answer "Invalid credentials" for anything
// that does not match, not leak which rule an input broke.
export class LoginDto {
  @IsString()
  @MaxLength(254)
  email: string;

  @IsString()
  @MaxLength(128)
  password: string;
}
