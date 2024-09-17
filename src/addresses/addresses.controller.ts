import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ReqUser, Roles } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { UserRole } from '../utils/types/user-roles';
import { User } from '@prisma/client';
import { GetAddressesDto } from './dto/get-products.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Post()
  create(
    @Body() createAddressDto: CreateAddressDto,
    @ReqUser() currentUser: User,
  ) {
    return this.addressesService.create(createAddressDto, currentUser);
  }

  @Get()
  findAll(
    @Query() getAddresses: GetAddressesDto,
    @ReqUser() currentUser: User,
  ) {
    return this.addressesService.findAll(getAddresses, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get(':id')
  findOne(@Param('id') id: string, @ReqUser() currentUser: User) {
    return this.addressesService.findOne(id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @ReqUser() currentUser: User,
  ) {
    return this.addressesService.update(id, updateAddressDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }
}
