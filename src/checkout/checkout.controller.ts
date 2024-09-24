import { Controller, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { ReqUser, Roles } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/utils/types/user-roles';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.USER)
  @Post()
  create(@ReqUser() currentUser: User) {
    return this.checkoutService.create(currentUser);
  }
}
