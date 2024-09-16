import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, User } from '@prisma/client';
import { PaginateService } from '../paginate/paginate.service';
import { PrismaService } from '../prisma/prisma.service';
import { customResponse } from '../utils/functions/customResponse';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private paginate: PaginateService,
  ) {}
  async create(createProductDto: CreateProductDto, currentUser: User, request) {
    const { store } = request;
    const { name, price, stock } = createProductDto;
    try {
      const newProduct = await this.prisma.product.create({
        data: {
          name,
          price,
          stock,
          store: {
            connect: {
              id: store.id,
            },
          },
        },
      });
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not create product',
          error: error.message,
        }),
      );
    }
  }

  async findAll(getProducts: GetProductsDto) {
    try {
      const { pagination, page, limit, name } = getProducts;

      const query = {
        name,
      };
      const users = await this.paginate.paginator<
        User,
        Prisma.ProductWhereInput,
        Prisma.ProductSelect,
        Prisma.ProductInclude,
        | Prisma.ProductOrderByWithRelationInput
        | Prisma.ProductOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.user,
        condition: {
          where: {
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            store: true,
            id: true,
            price: true,
            stock: true,
            name: true,
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not retrieve users.',
          error: error,
        }),
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          id,
        },
      });

      if (!product) {
        throw new InternalServerErrorException(
          customResponse({
            status: false,
            code: HttpStatus.NOT_FOUND,
            message: 'Product not found',
          }),
        );
      }

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        data: product,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not find product',
          error: error.message,
        }),
      );
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    currentUser: User,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        store: true,
      },
    });
    if (currentUser.id !== product.store.creatorId) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to update this product',
        }),
      );
    }
    try {
      const updatedProduct = await this.prisma.product.update({
        where: {
          id,
        },
        data: {
          ...updateProductDto,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not update product',
          error: error.message,
        }),
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
