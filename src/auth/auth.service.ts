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

  // async signUp(signUpDto: SignUpDto): Promise<User> {
  //   const user = await this.userService.create(signUpDto);

  //   // Sign tokens
  //   // const tokens =
  //   // Updates user refresh token on db
  //   // Return tokens
  // }

  logout() {
    return 'I am logout';
  }

  refreshTokens() {
    return 'I am refresh tokens';
  }
}
