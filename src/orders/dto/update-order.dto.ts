import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  orderID: number;

  @IsOptional()
  @IsEnum(['completed', 'cancel'])
  status: string;
}
