import { tokensInfoStub } from '../test/stubs/tokens-info.stub';

export const AuthService = jest.fn().mockReturnValue({
  signIn: jest.fn().mockResolvedValue(tokensInfoStub()),
  signUp: jest.fn().mockResolvedValue(tokensInfoStub()),
  refreshTokens: jest.fn().mockResolvedValue(tokensInfoStub()),
  signTokens: jest.fn().mockResolvedValue(tokensInfoStub()),
  verifyPasswords: jest.fn().mockResolvedValue(true),
});
