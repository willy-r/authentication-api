import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dtos';
import { TokensInfo } from './types';
import { JwtRefreshGuard } from '../shared/guards';
import { GetCurrentUser, MakePublic } from '../shared/decorators';

@Controller('auth')
@ApiTags('auth')
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

  @ApiBearerAuth()
  @Get('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@GetCurrentUser('sub') userId: string): Promise<void> {
    return await this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @MakePublic()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refreshTokens(
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string
  ): Promise<TokensInfo> {
    return await this.authService.refreshTokens(userId, refreshToken);
  }
}
