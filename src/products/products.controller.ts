import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '@prisma/client';
import { Roles, ReqUser } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { UserRole } from '../utils/types/user-roles';
import { StoreExistsInterceptor } from '../stores/interceptor';
import { GetProductsDto } from './dto/get-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @Post()
  @UseInterceptors(StoreExistsInterceptor)
  create(
    @Body() createProductDto: CreateProductDto,
    @ReqUser() currentUser: User,
    @Req() request: any,
  ) {
    return this.productsService.create(createProductDto, currentUser, request);
  }

  @Get()
  findAll(@Query() getProducts: GetProductsDto) {
    return this.productsService.findAll(getProducts);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @Patch(':id')
  @UseInterceptors(StoreExistsInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @ReqUser() currentUser: User,
  ) {
    return this.productsService.update(id, updateProductDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
