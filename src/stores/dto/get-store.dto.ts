import { IsOptional } from 'class-validator';

export class GetStoreDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  pagination?: boolean;

  @IsOptional()
  name?: string;
}
