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
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(tokensInfoStub());
      jest.spyOn(authService, 'verifyPasswords').mockResolvedValueOnce(true);
      await authService.signIn(signInDto);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userStub().id,
        tokensInfoStub().refreshToken
      );
    });

    it('when signIn is called then it should return tokens info', async () => {
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(tokensInfoStub());
      jest.spyOn(authService, 'verifyPasswords').mockResolvedValueOnce(true);
      const tokensInfo = await authService.signIn(signInDto);

      expect(tokensInfo).toEqual(tokensInfoStub());
    });

    it('when signIn is called then it should throw UnauthorizedException for user not found', async () => {
      jest.spyOn(authService, 'verifyPasswords').mockResolvedValueOnce(true);
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('when signIn is called then it should throw UnauthorizedException for invalid password', async () => {
      jest.spyOn(authService, 'verifyPasswords').mockResolvedValueOnce(false);

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
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(tokensInfoStub());
      await authService.signUp(signUpDto);

      expect(userService.create).toHaveBeenCalledWith(signUpDto);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userStub().id,
        tokensInfoStub().refreshToken
      );
    });

    it('when signUp is called then it should return tokens info', async () => {
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(tokensInfoStub());
      const tokensInfo = await authService.signUp(signUpDto);

      expect(tokensInfo).toEqual(tokensInfoStub());
    });

    it('when signUp is called then it should throw ConflictException for already created user', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValueOnce(new ConflictException('Email already exists'));

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
      jest
        .spyOn(authService, 'verifyRefreshTokens')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(updatedTokensInfoStub());
      await authService.refreshTokens(userId, refreshToken);

      expect(userService.findOneById).toHaveBeenCalledWith(userId);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        userId,
        updatedTokensInfoStub().refreshToken
      );
    });

    it('when refreshTokens is called then it should return updated refresh token', async () => {
      jest
        .spyOn(authService, 'verifyRefreshTokens')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(authService, 'signTokens')
        .mockResolvedValueOnce(updatedTokensInfoStub());
      const tokensInfo = await authService.refreshTokens(userId, refreshToken);

      expect(tokensInfo).toEqual(updatedTokensInfoStub());
      expect(tokensInfo.refreshToken).not.toBe(refreshToken);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException for user not found', async () => {
      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(null);

      await expect(
        authService.refreshTokens(userId, refreshToken)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException for unauthenticated user', async () => {
      jest
        .spyOn(userService, 'findOneById')
        .mockResolvedValueOnce(unauthenticatedUserStub());

      await expect(
        authService.refreshTokens(userId, refreshToken)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('when refreshTokens is called then it should throw UnauthorizedException if refresh tokens do not match', async () => {
      jest
        .spyOn(authService, 'verifyRefreshTokens')
        .mockResolvedValueOnce(false);

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
      jest.spyOn(configService, 'get').mockReturnValue('mock-env');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');
      await authService.signTokens(jwtPayload);

      expect(configService.get).toHaveBeenCalledWith('ACCESS_TOKEN_SECRET');
      expect(configService.get).toHaveBeenCalledWith('ACCESS_TOKEN_EXPIRES');
      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_SECRET');
      expect(configService.get).toHaveBeenCalledWith('REFRESH_TOKEN_EXPIRES');
    });

    it('when signTokens is called then it should call JwtService', async () => {
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('mock-access-token-secret')
        .mockReturnValueOnce('mock-access-token-expires')
        .mockReturnValueOnce('mock-refresh-token-secret')
        .mockReturnValueOnce('mock-refresh-token-expires');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');
      await authService.signTokens(jwtPayload);

      const accessTokenOptions: JwtSignOptions = {
        secret: 'mock-access-token-secret',
        expiresIn: 'mock-access-token-expires',
      };
      const refreshTokenOptions: JwtSignOptions = {
        secret: 'mock-refresh-token-secret',
        expiresIn: 'mock-refresh-token-expires',
      };

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        jwtPayload,
        accessTokenOptions
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        jwtPayload,
        refreshTokenOptions
      );
    });

    it('when signTokens is called then it should return tokens', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('mock-env');
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(tokensInfoStub().accessToken)
        .mockResolvedValueOnce(tokensInfoStub().refreshToken);
      const tokensInfo = await authService.signTokens(jwtPayload);

      expect(tokensInfo).toEqual(tokensInfoStub());
    });
  });
});
