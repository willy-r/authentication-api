import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dtos';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  signIn() {
    return 'I am sign in!';
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // Get password
    const { password, ...data } = signUpDto;
    // Hash password
    const hashedPassword = await argon2.hash(password);
    try {
      // Save user in db
      const user = await this.prismaService.user.create({
        data: {
          ...data,
          hashedPassword,
        },
      });
      // Return user without hashed password
      delete user.hashedPassword;
      delete user.hashedRefreshToken;
      return user;
    } catch (err) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  logout() {
    return 'I am logout';
  }

  refreshTokens() {
    return 'I am refresh tokens';
  }
}
