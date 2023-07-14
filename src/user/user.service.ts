import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../config/prisma/prisma.service';
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

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOneById(id: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
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

  async removeHashedRefreshToken(userId: string): Promise<void> {
    // Only updates if hashedRefreshToken is not null to avoid
    // unecessary updates on database.
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async updateUserRole(userId: string, userRole: UserRole): Promise<User> {
    try {
      return await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          role: userRole,
        },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundException(`Record ${userId} to update not found`);
      }
    }
  }
}
