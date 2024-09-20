import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User, Cart } from '@prisma/client';
import { customResponse } from '../utils/functions/customResponse';
import { OnEvent } from '@nestjs/event-emitter';
import { UserWithoutPassword } from 'src/auth/types';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

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
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId: currentUser.id,
      },
      include: {
        products: true,
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
        where: {
          id: cart.id,
        },
        data: {
          products: {
            set: [],
          },
          totalPrice: 0.0,
          shippingFee: 0.0,
        },
      });

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Cart emptied successfully',
        data: emptyCart,
      });
    }

    if (actionType === 'remove') {
      const removeProduct = await this.prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          products: {
            disconnect: {
              id: productId,
            },
          },
        },
      });

      if (!removeProduct) {
        return customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Product has been removed from cart',
          error: 'Product has been removed from cart',
        });
      }

      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'Product has been removed from cart',
        data: removeProduct,
      });
    }

    // Check if the product is already in the cart
    const productExists = cart.products.some(
      (product) => product.id === updateCartDto.productId,
    );

    if (productExists) {
      return customResponse({
        status: false,
        code: HttpStatus.OK,
        message: 'Product has been added to cart',
        error: 'Product has been added to cart',
      });
    }

    let product;
    if (productId) {
      product = await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
    }

    const totalPriceOfCart = cart.products.reduce(
      (acc, product) => acc + product.price,
      cart.totalPrice,
    );
    const totalPrice = totalPriceOfCart + product.price;
    console.log('totalPrice:', totalPrice);

    const shippingFeeOfCart = cart.products.reduce(
      (acc, product) => acc + product.shippingFee,
      cart.shippingFee,
    );
    const shippingFee = shippingFeeOfCart + product.shippingFee;
    const updatedCart = await this.prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        products: {
          connect: {
            id: productId,
          },
        },
        totalPrice,
        shippingFee,
      },
      include: {
        products: true,
      },
    });
    if (!updatedCart) {
      return customResponse({
        status: false,
        code: HttpStatus.BAD_REQUEST,
        message: 'Could not update cart',
        error: 'Could not update cart',
      });
    }
    return customResponse({
      status: true,
      code: HttpStatus.OK,
      message: 'Cart updated successfully',
      data: updatedCart,
    });
  }
}
