import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos';
import { TokensInfo } from './types';
import { JwtGuard, JwtRefreshGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn() {
    return this.authService.signIn();
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<TokensInfo> {
    return await this.authService.signUp(signUpDto);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refreshTokens() {
    return this.authService.refreshTokens();
  }
}
