import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  signIn() {
    return 'I am sign in!';
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    return this.userService.create(signUpDto);
  }

  logout() {
    return 'I am logout';
  }

  refreshTokens() {
    return 'I am refresh tokens';
  }
}
