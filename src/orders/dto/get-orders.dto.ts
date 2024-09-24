import { IsEnum, IsOptional } from 'class-validator';

export class GetOrdersDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  pagination?: boolean;

  @IsEnum(['pending', 'processing', 'shipped', 'completed', 'canceled'])
  status?: string;
}
