import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Prisma, Store, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { customResponse } from '../utils/functions/customResponse';
import { PaginateService } from '../paginate/paginate.service';
import { GetStoreDto } from './dto/get-store.dto';

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private paginate: PaginateService,
  ) {}
  async create(createStoreDto: CreateStoreDto, currentUser: User) {
    const hasCreatedStore = await this.prisma.store.findUnique({
      where: {
        creatorId: currentUser.id,
      },
    });
    console.log('hasCreatedStore', hasCreatedStore);
    if (hasCreatedStore) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'You have already created a store',
        }),
      );
    }
    try {
      const newStore = await this.prisma.store.create({
        data: {
          name: createStoreDto.name,
          bio: createStoreDto.bio,
          creator: {
            connect: {
              id: currentUser.id,
            },
          },
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.CREATED,
        message: 'Store created successfully',
        data: newStore,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not create store',
          error: error.message,
        }),
      );
    }
  }

  async findAll(getStores: GetStoreDto) {
    try {
      const { page, limit, pagination, name } = getStores;
      const query = {
        name,
      };
      const stores = await this.paginate.paginator<
        Store,
        Prisma.StoreWhereInput,
        Prisma.StoreSelect,
        Prisma.StoreInclude,
        | Prisma.StoreOrderByWithRelationInput
        | Prisma.StoreOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.store,
        condition: {
          where: {
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            id: true,
            name: true,
            bio: true,
            creatorId: true,
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'Stores retrieved successfully',
        data: stores,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not get stores',
          error: error.message,
        }),
      );
    }
  }

  async getUserCurrentStore(currentUser: User) {
    try {
      const store = await this.prisma.store.findUnique({
        where: {
          creatorId: currentUser.id,
        },
        include: {
          creator: {
            omit: {
              password: true,
              phoneNumber: true,
            },
          },
          storeCategories: true,
        },
      });
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Store found successfully',
        data: store,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not get store',
          error: error.message,
        }),
      );
    }
  }

  async findOne(identifier: string) {
    const store = await this.prisma.store.findUnique({
      where: {
        id: identifier,
      },
      include: {
        creator: {
          omit: {
            password: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!store) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Could not find store',
        }),
      );
    }
    try {
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Store found successfully',
        data: store,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not get store',
          error: error.message,
        }),
      );
    }
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, currentUser: User) {
    const store = await this.prisma.store.findUnique({
      where: {
        id: id,
      },
      include: {
        creator: {
          omit: {
            password: true,
            phoneNumber: true,
          },
        },
      },
    });
    if (currentUser.id !== store.creatorId) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'You are not allowed to update this store',
        }),
      );
    }
    try {
      const updatedStore = await this.prisma.store.update({
        where: {
          id: id,
        },
        data: {
          name: updateStoreDto.name,
          bio: updateStoreDto.bio,
        },
        include: {
          creator: {
            omit: {
              password: true,
              phoneNumber: true,
            },
          },
        },
      });
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Store updated successfully',
        data: updatedStore,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not update store',
          error: error.message,
        }),
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} store`;
  }
}
