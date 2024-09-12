import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { customResponse } from 'src/utils/functions/customResponse';
import { UserRole } from 'src/utils/types/user-roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException(
        customResponse({
          code: HttpStatus.UNAUTHORIZED,
          status: false,
          error: 'Unauthorized user',
          message: 'Unauthorized user',
          token_expired: true,
        }),
      );
    }
    const hasRequiredRole = requiredRoles.some((role) =>
      user.role?.includes(role),
    );

    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        customResponse({
          code: HttpStatus.UNAUTHORIZED,
          status: false,
          error: 'Unauthorized user role',
          message: 'Unauthorized user role',
        }),
      );
    }
    return true;
  }
}
