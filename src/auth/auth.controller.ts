import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dtos';
import { TokensInfo } from './types';
import { JwtRefreshGuard } from './guards';
import { MakePublic } from 'src/shared/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MakePublic()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto): Promise<TokensInfo> {
    return await this.authService.signIn(signInDto);
  }

  @MakePublic()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<TokensInfo> {
    return await this.authService.signUp(signUpDto);
  }

  @Get('logout')
  logout() {
    return this.authService.logout();
  }

  @MakePublic()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refreshTokens() {
    return this.authService.refreshTokens();
  }
}
