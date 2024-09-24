import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsEnum(['add', 'removeOne', 'emptyCart', 'checkout', 'increase', 'decrease'])
  @IsNotEmpty()
  actionType: string;
}
