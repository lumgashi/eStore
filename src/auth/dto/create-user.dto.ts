import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'First Name should not be string' })
  @IsNotEmpty({ message: 'First Name should not be empty' })
  @ApiProperty({ example: 'John Doe' })
  firstName: string;

  @IsString({ message: 'Last Name should not be string' })
  @IsNotEmpty({ message: 'Last Name should not be empty' })
  @ApiProperty({ example: 'John Doe' })
  lastName: string;

  @IsEmail({}, { message: 'Email is not correct' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @Transform((param) => param.value.toLowerCase())
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+00012324323' })
  phoneNumber?: string;

  //@IsStrongPassword({}, { message: 'Email is not correct' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @ApiProperty({ example: 'randompassword' })
  password: string;
}
