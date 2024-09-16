import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStoreCategoryDto } from './dto/create-store-category.dto';
import { UpdateStoreCategoryDto } from './dto/update-store-category.dto';
import { PaginateService } from '../paginate/paginate.service';
import { PrismaService } from '../prisma/prisma.service';
import { customResponse } from '../utils/functions/customResponse';
import { User } from '@prisma/client';

@Injectable()
export class StoreCategoriesService {
  constructor(
    private prisma: PrismaService,
    private paginate: PaginateService,
  ) {}
  async create(
    createStoreCategoryDto: CreateStoreCategoryDto,
    currentUser: User,
  ) {
    const { name } = createStoreCategoryDto;
    const storeExists = await this.prisma.store.findUnique({
      where: {
        creatorId: currentUser.id,
      },
    });
    const storeCategory = await this.prisma.storeCategory.findUnique({
      where: {
        storeId_name: {
          storeId: storeExists.id,
          name: name,
        },
      },
    });

    if (storeCategory) {
      throw new BadRequestException({
        status: false,
        code: HttpStatus.BAD_REQUEST,
        message: 'Store category already exists',
      });
    }

    try {
      const newStoreCategory = await this.prisma.storeCategory.create({
        data: {
          name: name,
          storeId: storeExists.id,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.CREATED,
        message: 'Store category created successfully',
        data: newStoreCategory,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not create store category',
          error: error,
        }),
      );
    }
  }

  findAll() {
    return `This action returns all storeCategories`;
  }

  findOne(id: string) {
    return `This action returns a #${id} storeCategory`;
  }

  update(id: number, updateStoreCategoryDto: UpdateStoreCategoryDto) {
    return `This action updates a #${id} storeCategory ${updateStoreCategoryDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} storeCategory`;
  }
}
