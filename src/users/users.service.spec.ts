import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaginateService } from '../paginate/paginate.service';
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule], // Keep only modules in imports
      providers: [UsersService, PaginateService], // Place services in providers
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Successfully retrieve all users with pagination and filters
  it('should retrieve all users with pagination and filters when users exist', async () => {
    const prismaService = { user: { findMany: jest.fn(), count: jest.fn() } };
    const paginateService = { paginator: jest.fn() };
    const usersService = new UsersService(
      prismaService as any,
      paginateService,
    );

    const getUsersDto = {
      isActive: true,
      pagination: true,
      page: 1,
      limit: 10,
      email: 'test@example.com',
      role: 'user',
      firstName: 'John',
      lastName: 'Doe',
    };

    const paginatedResult = {
      docs: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
        },
      ],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        limit: 10,
        prev: null,
        next: null,
      },
    };

    paginateService.paginator.mockResolvedValue(paginatedResult);

    const result = await usersService.findAll(getUsersDto);

    expect(result).toEqual({
      status: true,
      code: HttpStatus.FOUND,
      message: 'Users retrieved successfully',
      data: paginatedResult,
    });
  });

  it('should return user data when a valid ID is provided', async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'John Doe' }),
      },
    };
    const paginateService = { paginator: jest.fn() };
    const usersService = new UsersService(
      mockPrismaService as any,
      paginateService,
    );
    const result = await usersService.findOne('1');
    expect(result).toEqual({
      status: true,
      code: HttpStatus.FOUND,
      message: 'User retrieved successfully',
      data: { id: '1', name: 'John Doe' },
    });
  });

  it('should throw NotFoundException when user with the given ID does not exist', async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const paginateService = { paginator: jest.fn() };
    const usersService = new UsersService(
      mockPrismaService as any,
      paginateService,
    );
    await expect(usersService.findOne('1')).rejects.toThrow(NotFoundException);
  });

  // Successfully updates user when currentUser.id matches id
  it('should update user successfully when currentUser.id matches id', async () => {
    const prismaService = { user: { update: jest.fn() } };
    const customResponse = jest.fn();
    const updateUserDto = { firstName: 'John', lastName: 'Doe' };
    const currentUser = { id: '123' };
    const id = '123';
    const updatedUser = { id: '123', firstName: 'John', lastName: 'Doe' };

    prismaService.user.update.mockResolvedValue(updatedUser);
    customResponse.mockReturnValue({
      status: true,
      code: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    });

    const usersService = new UsersService(
      prismaService as any,
      customResponse as any,
    );
    const result = await usersService.update(
      id,
      updateUserDto,
      currentUser as any,
    );

    expect(result).toEqual({
      status: true,
      code: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    });
    expect(prismaService.user.update).toHaveBeenCalledWith({
      omit: { password: true },
      where: { id },
      data: { ...updateUserDto },
    });
  });

  // Throws ForbiddenException when currentUser.id does not match id
  it('should throw ForbiddenException when currentUser.id does not match id', async () => {
    const prismaService = { user: { update: jest.fn() } };
    const customResponse = jest.fn();
    const updateUserDto = { firstName: 'John', lastName: 'Doe' };
    const currentUser = { id: '123' };
    const id = '456';

    customResponse.mockReturnValue({
      status: false,
      code: HttpStatus.CONFLICT,
      message: 'You are not allowed to update this user.',
      error: 'You are not allowed to update this user.',
    });

    const usersService = new UsersService(
      prismaService as any,
      customResponse as any,
    );

    await expect(
      usersService.update(id, updateUserDto, currentUser as any),
    ).rejects.toThrow(
      new ForbiddenException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'You are not allowed to update this user.',
          error: 'You are not allowed to update this user.',
        }),
      ),
    );
  });
});
