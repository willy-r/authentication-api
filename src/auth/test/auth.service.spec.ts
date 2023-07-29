import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { userStub } from 'src/user/test/stubs';
import { AuthService } from '../auth.service';
import { SignInDto } from '../dtos';
import { tokensInfoStub } from './stubs';

jest.mock('src/user/user.service');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService, ConfigService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

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
});
