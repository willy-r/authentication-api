import { updateRoleUserStub, userStub, usersStub } from '../test/stubs';

export const UserService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(userStub()),
  findAll: jest.fn().mockResolvedValue(usersStub()),
  findOneByEmail: jest.fn().mockResolvedValue(userStub()),
  findOneById: jest.fn().mockResolvedValue(userStub()),
  updateHashedRefreshToken: jest.fn(),
  removeHashedRefreshToken: jest.fn(),
  updateUserRole: jest.fn().mockResolvedValue(updateRoleUserStub()),
});
