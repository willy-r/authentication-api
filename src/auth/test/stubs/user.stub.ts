import { User, UserRole } from '@prisma/client';

export const userStub = (): User => {
  return {
    id: 'mock-uuid',
    email: 'user@test.com',
    name: 'User Test',
    role: UserRole.USER,
    hashedPassword: 'mock-hashed-password',
    hashedRefreshToken: 'hashed-refresh-token',
    createdAt: new Date('2023-07-27 00:00:00'),
    updatedAt: new Date('2023-07-27 00:00:00'),
  };
};
