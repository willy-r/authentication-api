import { User, UserRole } from '@prisma/client';

export const userStub = (): User => {
  return {
    id: 'mock-uuid',
    email: 'user@test.com',
    name: 'User Test',
    role: UserRole.USER,
    hashedPassword: 'mock-hashed-password',
    hashedRefreshToken: 'mock-hashed-refresh-token',
    createdAt: new Date('2023-07-27 00:00:00'),
    updatedAt: new Date('2023-07-27 00:00:00'),
  };
};

export const usersStub = (): User[] => {
  return [userStub(), userStub()];
};

export const updatedRoleUserStub = (): User => {
  return { ...userStub(), role: UserRole.ADMIN };
};

export const unauthenticatedUserStub = (): User => {
  return { ...userStub(), hashedRefreshToken: null };
};

export const createUserStub = (): User => {
  return { ...userStub(), hashedRefreshToken: null };
};

export const updatedRefreshTokenUserStub = (): User => {
  return { ...userStub(), hashedRefreshToken: 'updated-hashed-refresh-token' };
};
