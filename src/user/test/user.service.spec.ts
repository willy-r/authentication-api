import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UserService } from '../user.service';
import { PrismaServiceMock } from './mocks';
import { CreateUserDto } from '../dtos';
import { createUserStub, userStub, usersStub } from './stubs';

describe('UserService Unit', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useClass: PrismaServiceMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create()', () => {
    const createUserDto: CreateUserDto = {
      email: userStub().email,
      password: '123',
      name: userStub().name,
    };

    it('when create is called then it should call PrismaService', async () => {
      jest
        .spyOn(userService, 'hashSecret')
        .mockResolvedValueOnce(userStub().hashedPassword);
      await userService.create(createUserDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          hashedPassword: userStub().hashedPassword,
        },
      });
    });

    it('when create is called then it should return prisma user', async () => {
      jest
        .spyOn(userService, 'hashSecret')
        .mockResolvedValueOnce(userStub().hashedPassword);
      const user = await userService.create(createUserDto);

      expect(user).toEqual(createUserStub());
    });

    it('when create is called then it should throw ConflictException if user already exists', async () => {
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValueOnce({ code: 'P2002' });

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll()', () => {
    it('when findAll is called then it should call PrismService', async () => {
      await userService.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith();
    });

    it('when findAll is called then it should return array with prisma users', async () => {
      const users = await userService.findAll();

      expect(users).toHaveLength(usersStub().length);
      expect(users).toEqual(usersStub());
    });

    it('given no users when findAll is called then it should return empty array', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
      const users = await userService.findAll();

      expect(users).toHaveLength(0);
      expect(users).toEqual([]);
    });
  });

  describe('findOneByEmail()', () => {
    const userEmail = userStub().email;

    it('when findOneByEmail is called then it should call PrismaService', async () => {
      await userService.findOneByEmail(userEmail);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: userEmail,
        },
      });
    });

    it('when findOneByEmail is called then it should return prisma user', async () => {
      const user = await userService.findOneByEmail(userEmail);

      expect(user).toEqual(userStub());
    });

    it('when findOneByEmail is called then it should return null for not found user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      expect(await userService.findOneByEmail(userEmail)).toBeNull();
    });
  });

  describe('findOneById()', () => {
    const userId = userStub().id;

    it('when findOneById is called then it should call PrismaService', async () => {
      await userService.findOneById(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
      });
    });

    it('when findOneById is called then it should return prisma user', async () => {
      const user = await userService.findOneById(userId);

      expect(user).toEqual(userStub());
    });

    it('when findOneById is called then it should return null for not found user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      expect(await userService.findOneById(userId)).toBeNull();
    });
  });
});
