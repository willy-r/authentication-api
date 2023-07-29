import { Test, TestingModule } from '@nestjs/testing';
import { userStub } from 'src/user/test/stubs';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignInDto } from '../dtos';
import { tokensInfoStub } from './stubs';

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
      expect(tokensInfo).toEqual(tokensInfoStub());
    });
  });
});
