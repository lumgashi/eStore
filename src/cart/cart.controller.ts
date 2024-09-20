import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ReqUser, Roles } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/utils/types/user-roles';
import { User } from '@prisma/client';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get()
  findOne(@ReqUser() currentUser: User) {
    return this.cartService.findOne(currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Patch()
  update(@ReqUser() currentUser: User, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(currentUser, updateCartDto);
  }
}
