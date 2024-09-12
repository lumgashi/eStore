import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type UserCreateBody = Prisma.UserCreateInput;
async function main() {
  const user: UserCreateBody = await prisma.user.create({
    data: {
      phoneNumber: '83288443',
      email: 'bI7wA@example.com',
      password: '12345678',
      firstName: 'John',
      lastName: 'Doe',
    },
  });
  console.log(user);
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
