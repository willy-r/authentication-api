import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...data } = createUserDto;
    const hashedPassword = await argon2.hash(password);
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          hashedPassword,
        },
      });
    } catch (err) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  async updateHashedRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }
}
