import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { StoreCategoriesService } from './store-categories.service';
import { CreateStoreCategoryDto } from './dto/create-store-category.dto';
import { UpdateStoreCategoryDto } from './dto/update-store-category.dto';
import { StoreExistsInterceptor } from '../stores/interceptor';
import { ReqUser, Roles } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { UserRole } from '../utils/types/user-roles';
import { StoresService } from 'src/stores/stores.service';
import { User } from '@prisma/client';

@Controller('store-categories')
export class StoreCategoriesController {
  constructor(
    private readonly storeCategoriesService: StoreCategoriesService,
    private storeService: StoresService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @Post()
  @UseInterceptors(StoreExistsInterceptor)
  async create(
    @Body() createStoreCategoryDto: CreateStoreCategoryDto,
    @ReqUser() currentUser: User,
  ) {
    return this.storeCategoriesService.create(
      createStoreCategoryDto,
      currentUser,
    );
  }

  @Get()
  findAll() {
    return this.storeCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreCategoryDto: UpdateStoreCategoryDto,
  ) {
    return this.storeCategoriesService.update(+id, updateStoreCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeCategoriesService.remove(+id);
  }
}
