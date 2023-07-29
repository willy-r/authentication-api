import {
  tokensInfoStub,
  updatedTokensInfoStub,
} from '../test/stubs/tokens-info.stub';

export const AuthService = jest.fn().mockReturnValue({
  signIn: jest.fn().mockResolvedValue(updatedTokensInfoStub()),
  signUp: jest.fn().mockResolvedValue(tokensInfoStub()),
  logout: jest.fn(),
  refreshTokens: jest.fn().mockResolvedValue(updatedTokensInfoStub()),
  signTokens: jest.fn().mockResolvedValue(tokensInfoStub()),
  verifyPasswords: jest.fn().mockResolvedValue(true),
});
