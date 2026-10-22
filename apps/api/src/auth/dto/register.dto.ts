import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @Length(1, 100)
  organizationName: string;
}
