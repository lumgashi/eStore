import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}
  async create(currentUser: User) {
    console.log(currentUser);
    const getUserCart = await this.prisma.cart.findUnique({
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
    this.eventEmitter.emit('user.checkout', currentUser, getUserCart);
    return 'This action adds a new checkout ${currentUser}';
  }
}
