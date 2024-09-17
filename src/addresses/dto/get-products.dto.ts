import { IsOptional } from 'class-validator';

export class GetAddressesDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  pagination?: boolean;
}
