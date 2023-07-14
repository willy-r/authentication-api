import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminUserData = {
    email: 'admin@admin.com',
    name: 'Administrator',
    hashedPassword: await argon2.hash('admin123'),
    role: UserRole.ADMIN,
  };
  const regularUserData = {
    email: 'user@user.com',
    name: 'User',
    hashedPassword: await argon2.hash('user123'),
    role: UserRole.USER,
  };

  await prisma.user.createMany({
    data: [adminUserData, regularUserData],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  });
