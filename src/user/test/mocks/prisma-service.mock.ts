import { createUserStub, userStub, usersStub } from '../stubs';

export const PrismaServiceMock = jest.fn().mockReturnValue({
  user: {
    create: jest.fn().mockResolvedValue(createUserStub()),
    findMany: jest.fn().mockResolvedValue(usersStub()),
    findUnique: jest.fn().mockResolvedValue(userStub()),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
});
