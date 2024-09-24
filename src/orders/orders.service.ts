import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateOrderId } from 'src/utils/functions/generateOrderId';
import { Order, OrderItem, Prisma, User } from '@prisma/client';
import { PaginateService } from 'src/paginate/paginate.service';
import { EmailService } from 'src/email/email.service';
import { placedOrderTemplate } from 'src/email/types/emailTemplates/order';
import { customResponse } from 'src/utils/functions/customResponse';
import { OnEvent } from '@nestjs/event-emitter';
import { GetOrdersDto } from './dto/get-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private paginate: PaginateService,
  ) {}
  @OnEvent('user.checkout')
  async create(reqUser: User, cartData: any) {
    const newOrder = await this.prisma.order.create({
      data: {
        userId: reqUser.id,
      },
      include: {
        orderItems: true,
      },
    });
    //console.log(newOrder);

    const cartItems = cartData.cartItems;

    // Declare 'cartItem' properly in the loop
    for await (const cartItem of cartItems) {
      const getProduct = await this.prisma.product.findUnique({
        where: {
          id: cartItem.productId,
        },
      });
      const newOrderItem = await this.prisma.orderItem.create({
        data: {
          quantity: cartItem.quantity,
          storeId: getProduct.storeId,
          orderID: generateOrderId(),
          order: {
            connect: {
              id: newOrder.id,
            },
          },
          product: {
            connect: {
              id: cartItem.productId,
            },
          },
        },
      });

      const storeOwner = await this.prisma.product.findUnique({
        where: {
          id: cartItem.productId,
        },
        include: {
          store: {
            include: {
              creator: {
                select: {
                  email: true,
                  firstName: true,
                },
              },
            },
          },
        },
      });

      const { email, firstName } = storeOwner.store.creator;

      await this.emailService.sendEmail(
        'Acme <onboarding@resend.dev>',
        email,
        `New Order Received – Order ${newOrderItem.orderID}`,
        placedOrderTemplate(firstName, newOrderItem, reqUser),
      );

      await this.prisma.product.update({
        where: {
          id: cartItem.productId,
        },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });

      await this.prisma.cart.update({
        where: {
          userId: reqUser.id,
        },
        data: {
          cartItems: {
            set: [],
          },
        },
      });
    }

    return customResponse({
      status: true,
      code: HttpStatus.OK,
      data: newOrder,
    });
  }

  async findAll(currentUser: User, getOrders: GetOrdersDto) {
    try {
      const { pagination, page, limit, status } = getOrders;

      const query = {
        userId: currentUser.id,
        status,
      };
      const orders = await this.paginate.paginator<
        Order,
        Prisma.OrderWhereInput,
        Prisma.OrderSelect,
        Prisma.OrderInclude,
        | Prisma.OrderOrderByWithRelationInput
        | Prisma.OrderOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.order,
        condition: {
          where: {
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            id: true,
            orderItems: {
              select: {
                id: true,
                orderID: true,
                product: true,
              },
            },
            createdAt: true,
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'Oders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not retrieve orders.',
          error: error,
        }),
      );
    }
  }

  async getStoreOrders(
    currentUser: User,
    getOrders: GetOrdersDto,
    request: any,
  ) {
    const storeId = request?.store?.id;

    try {
      const { pagination, page, limit, status } = getOrders;

      const query = {
        storeId: storeId,
        status,
      };
      const orders = await this.paginate.paginator<
        OrderItem,
        Prisma.OrderItemWhereInput,
        Prisma.OrderItemSelect,
        Prisma.OrderItemInclude,
        | Prisma.OrderItemOrderByWithRelationInput
        | Prisma.OrderItemOrderByWithRelationInput[]
      >({
        paginate: { pagination, page, limit },
        model: this.prisma.orderItem,
        condition: {
          where: {
            ...query,
          },
        },
        includeOrSelect: {
          operator: 'select',
          value: {
            id: true,
            orderID: true,
            product: true,
            order: true,
            createdAt: true,
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      return customResponse({
        status: true,
        code: HttpStatus.FOUND,
        message: 'Oders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'Could not retrieve orders.',
          error: error,
        }),
      );
    }
  }

  async findOne(orderID: number, currentUser: User) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: {
        orderID: orderID,
      },
      include: {
        product: true,
        order: true,
      },
    });

    if (!orderItem) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Order not found',
        }),
      );
    }

    if (orderItem.order.userId !== currentUser.id) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this order',
        }),
      );
    }

    return customResponse({
      status: true,
      code: HttpStatus.OK,
      data: orderItem,
      message: 'Order retrieved successfully',
    });
  }

  async updateUserOrder(
    orderID: number,
    updateOrderDto: UpdateOrderDto,
    currentUser: User,
  ) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: {
        orderID: orderID,
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Order not found',
        }),
      );
    }

    if (orderItem.order.userId !== currentUser.id) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this order',
        }),
      );
    }

    try {
      const updatedOrder = await this.prisma.orderItem.update({
        where: {
          orderID: updateOrderDto.orderID,
        },
        data: {
          ...updateOrderDto,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        data: updatedOrder,
        message: 'Order updated successfully',
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not update order',
          error: error,
        }),
      );
    }
  }
  async updateStoreOrder(
    orderID: number,
    updateOrderDto: UpdateOrderDto,
    currentUser: User,
    request: any,
  ) {
    const storeId = request?.store?.id;

    const orderItem = await this.prisma.orderItem.findUnique({
      where: {
        orderID: orderID,
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.NOT_FOUND,
          message: 'Order not found',
        }),
      );
    }

    if (orderItem.storeId !== storeId) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this order',
        }),
      );
    }

    try {
      const updatedOrder = await this.prisma.orderItem.update({
        where: {
          orderID: updateOrderDto.orderID,
        },
        data: {
          ...updateOrderDto,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        data: updatedOrder,
        message: 'Order updated successfully',
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not update order',
          error: error,
        }),
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
