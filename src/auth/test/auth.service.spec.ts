import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { unauthenticatedUserStub, userStub } from 'src/user/test/stubs';
import { AuthService } from '../auth.service';
import { SignInDto, SignUpDto } from '../dtos';
import { tokensInfoStub, updatedTokensInfoStub } from './stubs';
import { JwtPayload } from '../types';

jest.mock('src/user/user.service');

describe('AuthService Unit', () => {
  let authService: AuthService;
  let userService: UserService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService, ConfigService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('signIn()', () => {
    const signInDto: SignInDto = {
      email: userStub().email,
      password: '123',
    };

    it('when signIn is called then it should call UserService', async () => {
      authService.signTokens = jest.fn().mockResolvedValue(tokensInfoStub());
      authService.verifyPasswords = jest.fn().mockResolvedValue(true);
      await authService.signIn(signInDto);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userStub().id,
        tokensInfoStub().refreshToken
      );
    });

    it('when signIn is called then it should return tokens info', async () => {
      authService.signTokens = jest.fn().mockResolvedValue(tokensInfoStub());
      authService.verifyPasswords = jest.fn().mockResolvedValue(true);
      const tokensInfo = await authService.signIn(signInDto);

      expect(tokensInfo).toEqual(tokensInfoStub());
    });

    it('when signIn is called then it should throw UnauthorizedException for user not found', async () => {
      authService.verifyPasswords = jest.fn().mockResolvedValue(true);
      userService.findOneByEmail = jest.fn().mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('when signIn is called then it should throw UnauthorizedException for invalid password', async () => {
      authService.verifyPasswords = jest.fn().mockResolvedValue(false);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('signUp()', () => {
    const signUpDto: SignUpDto = {
      email: userStub().email,
      password: '123',
      name: userStub().name,
    };

    it('when signUp is called then it should call UserService', async () => {
      authService.signTokens = jest.fn().mockResolvedValue(tokensInfoStub());
      await authService.signUp(signUpDto);

      expect(userService.create).toHaveBeenCalledWith(signUpDto);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userStub().id,
        tokensInfoStub().refreshToken
      );
    });

    it('when signUp is called then it should return tokens info', async () => {
      authService.signTokens = jest.fn().mockResolvedValue(tokensInfoStub());
      const tokensInfo = await authService.signUp(signUpDto);

      expect(tokensInfo).toEqual(tokensInfoStub());
    });

    it('when signUp is called then it should throw ConflictException for already created user', async () => {
      userService.create = jest
        .fn()
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('logout()', () => {
    const userId = userStub().id;

    it('when logout is called then it should call UserService', async () => {
      await authService.logout(userId);

      expect(userService.removeHashedRefreshToken).toHaveBeenCalledWith(userId);
    });

    it('when logout is called then it should return nothing', async () => {
      expect(await authService.logout(userId)).toBeUndefined();
    });
  });

  describe('refreshTokens()', () => {
    const userId = userStub().id;
    const refreshToken = tokensInfoStub().refreshToken;

    it('when refreshTokens is called then it should call UserService', async () => {
      authService.verifyRefreshTokens = jest.fn().mockResolvedValue(true);
      authService.signTokens = jest
        .fn()
        .mockResolvedValue(updatedTokensInfoStub());
      await authService.refreshTokens(userId, refreshToken);

      expect(userService.findOneById).toHaveBeenCalledWith(userId);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userId,
        updatedTokensInfoStub().refreshToken
      );
    });

    it('when refreshTokens is called then it should return updated refresh token', async () => {
      authService.verifyRefreshTokens = jest.fn().mockResolvedValue(true);
      authService.signTokens = jest
        .fn()
        .mockResolvedValue(updatedTokensInfoStub());
      const tokensInfo = await authService.refreshTokens(userId, refreshToken);

      expect(tokensInfo).toEqual(updatedTokensInfoStub());
      expect(tokensInfo.refreshToken).not.toBe(refreshToken);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException for user not found', async () => {
      userService.findOneById = jest.fn().mockResolvedValue(null);
      await expect(
        authService.refreshTokens(userId, refreshToken)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException for unauthenticated user', async () => {
      userService.findOneById = jest
        .fn()
        .mockResolvedValue(unauthenticatedUserStub());
      await expect(
        authService.refreshTokens(userId, refreshToken)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException if refresh tokens do not match', async () => {
      authService.verifyRefreshTokens = jest.fn().mockResolvedValue(false);
      await expect(
        authService.refreshTokens(userId, refreshToken)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signTokens()', () => {
    const jwtPayload: JwtPayload = {
      sub: userStub().id,
      email: userStub().email,
      role: userStub().role,
      refreshToken: tokensInfoStub().refreshToken,
    };

    it('when signTokens is called then it should call ConfigService', async () => {
      configService.get = jest.fn().mockReturnValue('mock-env');
      jwtService.signAsync = jest.fn().mockResolvedValue('mock-token');
      await authService.signTokens(jwtPayload);

      expect(configService.get).toHaveBeenCalledWith('ACCESS_TOKEN_SECRET');
      expect(configService.get).toHaveBeenCalledWith('ACCESS_TOKEN_EXPIRES');
      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_SECRET');
      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_EXPIRES');
    });

    it('when signTokens is called then it should call JwtService', async () => {
      configService.get = jest.fn().mockReturnValue('mock-env');
      jwtService.signAsync = jest.fn().mockResolvedValue('mock-token');
      await authService.signTokens(jwtPayload);

      const jwtOptions: JwtSignOptions = {
        secret: 'mock-env',
        expiresIn: 'mock-env',
      };
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        jwtPayload,
        jwtOptions
      );
    });

    it('when signTokens is called then it should return tokens', async () => {
      configService.get = jest.fn().mockReturnValue('mock-env');
      jwtService.signAsync = jest.fn().mockResolvedValue('mock-token');
      const tokensInfo = await authService.signTokens(jwtPayload);

      expect(tokensInfo).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        accessType: 'Bearer',
      });
    });
  });
});
