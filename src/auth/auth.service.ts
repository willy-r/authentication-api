import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn() {
    return 'I am sign in!';
  }

  signUp() {
    return 'I am sign up!';
  }

  logout() {
    return 'I am logout';
  }

  refreshTokens() {
    return 'I am refresh tokens';
  }
}
