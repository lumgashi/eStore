import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/utils/types/user-roles';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
