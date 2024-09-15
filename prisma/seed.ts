import { Prisma, PrismaClient } from '@prisma/client';
import { UserRole } from 'src/utils/types/user-roles';

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
      role: UserRole.USER,
    },
  });
  console.log(user);

  const post = await prisma.post.create({
    data: {
      title: 'Hello World',
      content: 'This is my first post',
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  console.log(post);
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
