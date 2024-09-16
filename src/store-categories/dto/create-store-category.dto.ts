import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
