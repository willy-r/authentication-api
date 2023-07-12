import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { GetCurrentUser, Roles } from '../shared/decorators';
import { UserResponseDto } from './dtos';
import { UserService } from './user.service';
import { RolesGuard } from '../shared/guards';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users);
  }

  @Get('me')
  async getMe(@GetCurrentUser('sub') userId: string): Promise<UserResponseDto> {
    const user = this.userService.findOneById(userId);
    return plainToInstance(UserResponseDto, user);
  }
}
