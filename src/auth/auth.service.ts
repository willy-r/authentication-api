import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SignInDto, SignUpDto } from './dtos';
import { UserService } from '../user/user.service';
import { JwtPayload, TokensInfo } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signIn(signInDto: SignInDto): Promise<TokensInfo> {
    const user = await this.userService.findOneByEmail(signInDto.email);

    const passwordMatches = await argon2.verify(
      user?.hashedPassword || (await argon2.hash('dummy-pwd')), // To avoid timing attacks.
      signInDto.password
    );

    // Guard condition.
    if (!passwordMatches || !user) {
      throw new UnauthorizedException(
        'Invalid credentials. Please check your email and password'
      );
    }

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

  async logout(userId: string): Promise<void> {
    await this.userService.removeHashedRefreshToken(userId);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string
  ): Promise<TokensInfo> {
    const user = await this.userService.findOneById(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException(
        'Access denied. Please check if user exists or is logged in'
      );
    }

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException(
        'Access denied. Please check if user exists or is logged in'
      );
    }

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
