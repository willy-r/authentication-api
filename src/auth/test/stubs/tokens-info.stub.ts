import { TokensInfo } from 'src/auth/types';

export const tokensInfoStub = (): TokensInfo => {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    accessType: 'Bearer',
  };
};
