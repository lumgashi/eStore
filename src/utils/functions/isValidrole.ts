import { UserRole } from '../types/user-roles';

export const isValidRole = (role: string): role is keyof typeof UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};
