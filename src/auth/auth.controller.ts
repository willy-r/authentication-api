import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn() {
    return this.authService.signIn();
  }

  @Post('signup')
  signUp() {
    return this.authService.signUp();
  }

  @Get('logout')
  logout() {
    return this.authService.logout();
  }

  @Get('refresh')
  refreshTokens() {
    return this.authService.refreshTokens();
  }
}
