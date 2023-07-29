import { Test, TestingModule } from '@nestjs/testing';
import { userStub } from 'src/user/test/stubs';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignInDto, SignUpDto } from '../dtos';
import { tokensInfoStub, updatedTokensInfoStub } from './stubs';

jest.mock('../auth.service');

describe('AuthController Unit', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('signIn()', () => {
    const signInDto: SignInDto = {
      email: userStub().email,
      password: '123',
    };

    it('when signIn is called then it should call AuthService', async () => {
      await authController.signIn(signInDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('when signIn is called then it should return tokens info', async () => {
      const tokensInfo = await authController.signIn(signInDto);
      expect(tokensInfo).toEqual(updatedTokensInfoStub());
    });
  });

  describe('signUp()', () => {
    const signUpDto: SignUpDto = {
      email: userStub().email,
      password: '123',
      name: userStub().name,
    };

    it('when signUp is called then it should call AuthService', async () => {
      await authController.signUp(signUpDto);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('when signUp is called then it should return tokens info', async () => {
      const tokensInfo = await authController.signUp(signUpDto);
      expect(tokensInfo).toEqual(tokensInfoStub());
    });
  });

  describe('logout()', () => {
    const userId = userStub().id;

    it('when logout is called then it should call AuthService', async () => {
      await authController.logout(userId);
      expect(authService.logout).toHaveBeenCalledWith(userId);
    });

    it('when logout is called then it should return nothing', async () => {
      expect(await authController.logout(userId)).toBeUndefined();
    });
  });

  describe('refreshTokens()', () => {
    const userId = userStub().id;
    const refreshToken = tokensInfoStub().refreshToken;

    it('when refreshTokens is called then it should call AuthService', async () => {
      await authController.refreshTokens(userId, refreshToken);
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        userId,
        refreshToken
      );
    });

    it('when refreshTokens is called then it should return updated refresh token', async () => {
      const tokensInfo = await authController.refreshTokens(
        userId,
        refreshToken
      );
      expect(tokensInfo).toEqual(updatedTokensInfoStub());
      expect(tokensInfo.refreshToken).not.toBe(refreshToken);
    });
  });
});
