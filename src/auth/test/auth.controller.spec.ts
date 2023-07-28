import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { TokensInfo } from '../types';
import { SignInDto } from '../dtos';
import { tokensInfoStub, userStub } from './stubs';

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
    describe('when signIn is called', () => {
      let tokensInfo: TokensInfo;
      let signInDto: SignInDto;

      beforeEach(async () => {
        signInDto = {
          email: userStub().email,
          password: '123',
        };
        tokensInfo = await authController.signIn(signInDto);
      });

      it('then it should call AuthService', () => {
        expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      });

      it('then it should return tokens info', () => {
        expect(tokensInfo).toEqual(tokensInfoStub());
      });
    });
  });
});
