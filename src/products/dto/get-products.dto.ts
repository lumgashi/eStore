import { IsOptional, IsString } from 'class-validator';

export class GetProductsDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  pagination?: boolean;

  @IsOptional()
  @IsString()
  name?: string;
}
