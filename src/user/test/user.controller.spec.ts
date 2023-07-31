import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { updatedRoleUserStub, userStub, usersStub } from './stubs';
import { UpdateUserRoleDto, UserResponseDto } from '../dtos';

jest.mock('../user.service');

describe('UserController Unit', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('getMe()', () => {
    const userId = userStub().id;

    it('when getMe is called then it should call UserService', async () => {
      await userController.getMe(userId);

      expect(userService.findOneById).toHaveBeenCalledWith(userId);
    });

    it('when getMe is called then it should return user without secrets', async () => {
      const user = await userController.getMe(userId);

      expect(user).toBeInstanceOf(UserResponseDto);
      expect(user.hashedPassword).toBeUndefined();
      expect(user.hashedRefreshToken).toBeUndefined();
    });
  });

  describe('findAll()', () => {
    it('when findAll is called then it should call UserService', async () => {
      await userController.findAll();

      expect(userService.findAll).toHaveBeenCalledWith();
    });

    it('when findAll is called then it should return users without secrets', async () => {
      const users = await userController.findAll();

      expect(users).toHaveLength(usersStub().length);
      users.forEach((user) => {
        expect(user).toBeInstanceOf(UserResponseDto);
        expect(user.hashedPassword).toBeUndefined();
        expect(user.hashedRefreshToken).toBeUndefined();
      });
    });

    it('given no users when findAll is called then it should return empty array', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValueOnce([]);
      const users = await userController.findAll();

      expect(users).toHaveLength(0);
      expect(users).toEqual([]);
    });
  });

  describe('updateUserRole()', () => {
    const userId = userStub().id;
    const updateUserRoleDto: UpdateUserRoleDto = {
      newRole: updatedRoleUserStub().role,
    };

    it('when updateUserRole is called then it should call UserService', async () => {
      await userController.updateUserRole(userId, updateUserRoleDto);

      expect(userService.updateUserRole).toHaveBeenCalledWith(
        userId,
        updateUserRoleDto.newRole
      );
    });

    it('when updateUserRole is called then it should return user with updated role', async () => {
      const user = await userController.updateUserRole(
        userId,
        updateUserRoleDto
      );

      expect(user).toBeInstanceOf(UserResponseDto);
      expect(user.role).toBe(updatedRoleUserStub().role);
      expect(user.role).not.toBe(userStub().role);
    });

    it('when updateUserRole is called then it should return user without secrets', async () => {
      const user = await userController.updateUserRole(
        userId,
        updateUserRoleDto
      );

      expect(user).toBeInstanceOf(UserResponseDto);
      expect(user.hashedPassword).toBeUndefined();
      expect(user.hashedRefreshToken).toBeUndefined();
    });

    it('when updateUserRole is called then it should throw NotFoundException for user not found', async () => {
      jest
        .spyOn(userService, 'updateUserRole')
        .mockRejectedValueOnce(
          new NotFoundException(`Record ${userId} to update not found`)
        );

      await expect(
        userController.updateUserRole(userId, updateUserRoleDto)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
