import { TokensInfo } from 'src/auth/types';

export const tokensInfoStub = (): TokensInfo => {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    accessType: 'Bearer',
  };
};

export const updatedTokensInfoStub = (): TokensInfo => {
  return {
    ...tokensInfoStub(),
    refreshToken: 'updated-mock-refresh-token',
  };
};
