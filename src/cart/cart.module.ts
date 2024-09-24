import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [CartController],
  providers: [CartService, EmailService],
})
export class CartModule {}
