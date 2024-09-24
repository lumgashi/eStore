import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User, Cart, CartItem } from '@prisma/client';
import { customResponse } from '../utils/functions/customResponse';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserWithoutPassword } from 'src/auth/types';
import { EmailService } from 'src/email/email.service';
//import { placedOrderTemplate } from 'src/email/types/emailTemplates/order';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private emit: EventEmitter2,
    private emailService: EmailService,
  ) {}

  @OnEvent('user.created')
  async create(user: UserWithoutPassword) {
    try {
      const cart = await this.prisma.cart.create({
        data: {
          userId: user.id,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.CREATED,
        message: 'Cart created successfully',
        data: cart,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not create cart',
        error: error.message,
      });
    }
  }

  async findOne(currentUser: User) {
    let cart: Cart;
    cart = await this.prisma.cart.findUnique({
      where: {
        userId: currentUser.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: currentUser.id,
        },
      });
    }

    return customResponse({
      status: true,
      code: HttpStatus.OK,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  }

  async update(currentUser: User, updateCartDto: UpdateCartDto) {
    const { actionType, productId } = updateCartDto;
    let cart;
    cart = await this.prisma.cart.findUnique({
      where: {
        userId: currentUser.id,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (cart.userId !== currentUser.id) {
      return customResponse({
        status: false,
        code: HttpStatus.FORBIDDEN,
        message: 'You are not allowed to update this cart',
        error: 'You are not allowed to update this cart',
      });
    }

    if (actionType === 'emptyCart') {
      const emptyCart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: { cartItems: { set: [] } },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Cart emptied successfully',
        data: emptyCart,
      });
    }

    if (actionType === 'increase') {
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (actionType === 'removeOne') {
      const cartItemToRemove = await this.prisma.cartItem.findUnique({
        where: { productId },
      });
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          cartItems: {
            disconnect: {
              id: cartItemToRemove.id,
            },
          },
        },
      });

      await this.prisma.cartItem.delete({
        where: { id: cartItemToRemove.id },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Cart item removed successfully',
        data: cart, //carefull we migh not get the latest changes after deletion
      });
    }

    const isCartItemInCart = cart.cartItems.find(
      (cItem: CartItem) => cItem.productId === product.id,
    );

    console.log('isCartItemInCart::', isCartItemInCart);

    if (
      isCartItemInCart ||
      actionType === 'increase' ||
      actionType === 'decrease'
    ) {
      const query = {};
      if (actionType === 'increase' || isCartItemInCart)
        query['quantity'] = { increment: 1 };
      if (actionType === 'decrease') query['quantity'] = { decrement: 1 };
      await this.prisma.cartItem.update({
        where: { id: isCartItemInCart.id },
        data: { ...query },
      });
      const increaseOrDecrease =
        actionType === 'decrease'
          ? Number((cart.totalPrice - product.price).toFixed(2))
          : Number((cart.totalPrice + product.price).toFixed(2));
      cart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          totalPrice: increaseOrDecrease,
        },
      });
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Cart item updated successfully',
        data: cart, //carefull we migh not get the latest changes after deletion
      });
    }

    const newCartItem = await this.prisma.cartItem.create({
      data: {
        cart: {
          connect: {
            id: cart.id,
          },
        },
        product: {
          connect: {
            id: product.id,
          },
        },
        quantity: 1,
      },
    });

    const totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      product.price,
    );

    const shippingFee = cart.cartItems.reduce(
      (acc, item) => acc + item.product.shippingFee * item.quantity,
      product.shippingFee,
    );

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        cartItems: {
          connect: {
            id: newCartItem.id,
          },
        },
        totalPrice,
        shippingFee,
      },
    });

    if (!updatedCart) {
      return customResponse({
        status: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not update cart',
        error: 'Could not update cart',
      });
    }

    return customResponse({
      status: true,
      code: HttpStatus.OK,
      message: 'Cart updated successfully',
      data: cart,
    });
  }
}
