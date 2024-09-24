import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '@prisma/client';
import { ReqUser, Roles } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/utils/types/user-roles';
import { GetOrdersDto } from './dto/get-orders.dto';
import { StoreExistsInterceptor } from 'src/stores/interceptor';
import { UpdateStoreOrderDto } from './dto/update-store-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @Post()
  // create(@Body() createOrderDto: CreateOrderDto, @ReqUser() currentUser: User) {
  //   return this.ordersService.create(createOrderDto, currentUser);
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.USER)
  @Get('user/all')
  findAll(@ReqUser() currentUser: User, getOrders: GetOrdersDto) {
    return this.ordersService.findAll(currentUser, getOrders);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS)
  @Get('store/all')
  @UseInterceptors(StoreExistsInterceptor)
  getStoreOrders(
    @ReqUser() currentUser: User,
    getOrders: GetOrdersDto,
    @Req() request: Request,
  ) {
    return this.ordersService.getStoreOrders(currentUser, getOrders, request);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.USER)
  @Get(':orderID')
  findOne(@Param('orderID') id: string, @ReqUser() currentUser: User) {
    return this.ordersService.findOne(+id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.USER)
  @Patch(':orderID')
  update(
    @Param('orderID') orderID: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @ReqUser() currentUser: User,
  ) {
    return this.ordersService.updateUserOrder(
      orderID,
      updateOrderDto,
      currentUser,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS)
  @Patch(':orderID')
  @UseInterceptors(StoreExistsInterceptor)
  updateStoreOrder(
    @Param('orderID') orderID: number,
    @Body() updateOrderDto: UpdateStoreOrderDto,
    @ReqUser() currentUser: User,
    @Req() request: Request,
  ) {
    return this.ordersService.updateStoreOrder(
      orderID,
      updateOrderDto,
      currentUser,
      request,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
