import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies';
import { AllConfigType } from 'src/utils/types/config.types';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => ({
        secret: configService.getOrThrow('jwtSecret' as keyof AllConfigType, {
          infer: true,
        }),
        signOptions: {
          // expiresIn: configService.getOrThrow(
          //   'tokenExpiresIn' as keyof AllConfigType,
          //   {
          //     infer: true,
          //   },
          //   expiresIn: configService.getOrThrow('tokenExpiresIn' as keyof AllConfigType) as string | number
          // ),
          expiresIn: configService.getOrThrow(
            'tokenExpiresIn' as keyof AllConfigType,
          ) as string | number,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtService],
})
export class AuthModule {}
