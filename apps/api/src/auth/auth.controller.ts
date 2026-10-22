import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from './auth-context';
import { AuthService } from './auth.service';
import { CurrentAuth } from './current-auth.decorator';
import type { AuthResponse, MeResponse } from './dto/auth-response';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() input: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(input);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() input: LoginDto): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentAuth() auth: AuthContext): Promise<MeResponse> {
    return this.authService.me(auth);
  }
}
