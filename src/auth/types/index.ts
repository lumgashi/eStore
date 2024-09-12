import { Prisma } from '@prisma/client';

export type UserCreateBody = Prisma.UserCreateInput;
// Make 'password' optional
export type UserWithoutPassword = Omit<Prisma.UserCreateInput, 'password'> &
  Partial<Pick<Prisma.UserCreateInput, 'password'>>;
