import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email is not valid email' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @Transform((param) => param.value.toLowerCase())
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  //@IsStrongPassword({}, { message: 'Email is not correct' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @ApiProperty({ example: 'randompassword' })
  password: string;
}
