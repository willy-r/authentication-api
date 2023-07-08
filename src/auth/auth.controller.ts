import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn() {
    return this.authService.signIn();
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<UserResponseDto> {
    const user = await this.authService.signUp(signUpDto);
    return plainToInstance(UserResponseDto, user);
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
