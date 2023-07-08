import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SignUpDto } from './dtos';
import { UserService } from '../user/user.service';
import { JwtPayload, TokensInfo } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  signIn() {
    return 'I am sign in!';
  }

  async signUp(signUpDto: SignUpDto): Promise<TokensInfo> {
    const user = await this.userService.create(signUpDto);

    const tokens = await this.signTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userService.updateHashedRefreshToken(
      user.id,
      tokens.refreshToken
    );

    return tokens;
  }

  logout() {
    return 'I am logout';
  }

  refreshTokens() {
    return 'I am refresh tokens';
  }

  async signTokens(jwtPayload: JwtPayload): Promise<TokensInfo> {
    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES'),
    };
    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES'),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, accessTokenOptions),
      this.jwtService.signAsync(jwtPayload, refreshTokenOptions),
    ]);

    return {
      accessToken,
      refreshToken,
      accessType: 'Bearer',
    };
  }
}
