import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { GetCurrentUser, Roles } from '../shared/decorators';
import { UpdateUserRoleDto, UserResponseDto } from './dtos';
import { UserService } from './user.service';
import { RolesGuard } from '../shared/guards';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@GetCurrentUser('sub') userId: string): Promise<UserResponseDto> {
    const user = this.userService.findOneById(userId);
    return plainToInstance(UserResponseDto, user);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Put('update-role/:id')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUserRole(
      userId,
      updateUserRoleDto.newRole
    );
    return plainToInstance(UserResponseDto, user);
  }
}
