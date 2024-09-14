import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { customResponse } from '../utils/functions/customResponse';
import { GetUsersDto } from './dto/get-user.dto';
import { PaginateService } from '../paginate/paginate.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private paginate: PaginateService,
  ) {}

  async findAll(getUsers: GetUsersDto) {
    try {
      const {
        isActive,
        pagination,
        page,
        limit,
        email,
        role,
        firstName,
        lastName,
      } = getUsers;

      const query = {
        email,
        role,
      };
      if (firstName)
        query['firstName'] = { contains: firstName, mode: 'insensitive' };
      if (lastName)
        query['lastName'] = { contains: lastName, mode: 'insensitive' };
      const users = await this.paginate.paginator<
        User,
        Prisma.UserWhereInput,
        Prisma.UserSelect,
        Prisma.UserInclude,
        | Prisma.UserOrderByWithRelationInput
        | Prisma.UserOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.user,
        condition: {
          where: {
            isActive,
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            Post: {
              select: {
                content: true,
              },
            },
            store: true,
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    const user = await this.prisma.user.findUnique({
      omit: {
        password: true,
      },
      where: { id },
      include: {
        store: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        customResponse({
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Could not find user.',
          error: 'User not found.',
        }),
      );
    }
    try {
      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not retrieve user.',
          error: error,
        }),
      );
    }
  }
  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    if (currentUser.id !== id) {
      throw new ForbiddenException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'You are not allowed to update this user.',
          error: 'You are not allowed to update this user.',
        }),
      );
    }

    try {
      const updatedUser = await this.prisma.user.update({
        omit: {
          password: true,
        },
        where: { id },
        data: {
          ...updateUserDto,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not update user.',
          error: error.message,
        }),
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
