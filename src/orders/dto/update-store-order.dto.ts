import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateStoreOrderDto {
  @IsOptional()
  @IsNumber()
  orderID: number;

  @IsOptional()
  @IsEnum(['processing', 'shipped'])
  status: string;
}
