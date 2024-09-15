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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/utils/types/user-roles';
import { ReqUser, Roles } from 'src/auth/decorators';
import { User } from '@prisma/client';
import { GetStoreDto } from './dto/get-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @Post()
  create(@Body() createStoreDto: CreateStoreDto, @ReqUser() currentUser: User) {
    return this.storesService.create(createStoreDto, currentUser);
  }

  @Get()
  findAll(@Query() getStores: GetStoreDto) {
    return this.storesService.findAll(getStores);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @ReqUser() currentUser: User,
  ) {
    return this.storesService.update(id, updateStoreDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
