import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { customResponse } from '../utils/functions/customResponse';
import { GetAddressesDto } from './dto/get-products.dto';
import { PaginateService } from '../paginate/paginate.service';

@Injectable()
export class AddressesService {
  constructor(
    private prisma: PrismaService,
    private paginate: PaginateService,
  ) {}
  async create(createAddressDto: CreateAddressDto, currentUser: User) {
    const hasUserAddress = await this.prisma.address.findFirst({
      where: {
        userId: currentUser.id,
        isDefaultAddress: true,
      },
    });
    if (!hasUserAddress) createAddressDto.isDefaultAddress = true;

    try {
      const address = await this.prisma.address.create({
        data: {
          ...createAddressDto,
          userId: currentUser.id,
        },
      });
      return customResponse({
        status: true,
        code: HttpStatus.CREATED,
        message: 'Address created successfully',
        data: address,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not create address',
          error: error.message,
        }),
      );
    }
  }

  async findAll(getAddresses: GetAddressesDto, currentUser: User) {
    try {
      const { pagination, page, limit } = getAddresses;

      const query = {
        userId: currentUser.id,
      };
      const addresses = await this.paginate.paginator<
        User,
        Prisma.AddressWhereInput,
        Prisma.AddressSelect,
        Prisma.AddressInclude,
        | Prisma.AddressOrderByWithRelationInput
        | Prisma.AddressOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.address,
        condition: {
          where: {
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            id: true,
            city: true,
            street: true,
            country: true,
            isDefaultAddress: true,
            zip: true,
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'Addresses retrieved successfully',
        data: addresses,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not retrieve addresses.',
          error: error,
        }),
      );
    }
  }

  async findOne(id: string, currentUser: User) {
    const address = await this.prisma.address.findUnique({
      where: {
        id,
      },
    });

    if (!address) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Address not found',
        }),
      );
    }

    if (currentUser.id !== address.userId) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this address',
        }),
      );
    }

    return customResponse({
      status: true,
      code: HttpStatus.OK,
      message: 'Address retrieved successfully',
      data: address,
    });
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    currentUser: User,
  ) {
    const address = await this.prisma.address.findUnique({
      where: {
        id,
      },
    });

    if (currentUser.id !== address.userId) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to update this address',
        }),
      );
    }

    try {
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not update address',
          error: error.message,
        }),
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }
}
