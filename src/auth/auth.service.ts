import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { customResponse } from '../utils/functions/customResponse';
import { SuccessResponse, ErrorResponse } from '../utils/types/reponse-types';
import { hashPassword } from '../utils/functions/hashPassword';
import { UserWithoutPassword } from './types';
import { CreateUserDto } from './dto/create-user.dto';
import { prismaExclude } from '../utils/functions/excludeFields';
import { LoginDto } from './dto/login.dto';
import { matchPasswords } from '../utils/functions/comparePasswords';
import { tokenPayload } from '../utils/types/tokenPayloed';
import { signToken } from '../utils/functions/signToken';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { welcomeTemplate } from '../email/types/emailTemplates';
import { UserRole } from '../utils/types/user-roles';
import { isValidRole } from '../utils/functions/isValidrole';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(
    createUser: CreateUserDto,
  ): Promise<SuccessResponse | ErrorResponse> {
    const { email, phoneNumber, password, firstName, lastName, role } =
      createUser;

    //check if any user has been registred with such email
    const userExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException(
        customResponse({
          status: false,
          code: HttpStatus.CONFLICT,
          message: 'This email is already taken by a user.',
          error: 'This email is already taken by a user.',
        }),
      );
    }
    if (role === UserRole.ADMIN || role === UserRole.MODERATOR) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'User cannot be created',
          error: 'User cannot be created',
        }),
      );
    }
    //TODO : impletement npm deep-email-validator
    //https://soshace.com/verifying-an-email-address-without-sending-an-email-in-nodejs/?ref=dailydev
    const userRole = isValidRole(role) ? role : UserRole.USER;
    try {
      const hashedPassword = await hashPassword(password);
      const user: UserWithoutPassword = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          phoneNumber,
          role: userRole,
        },
        select: prismaExclude('User', ['password']),
      });

      await this.emailService.sendEmail(
        'Acme <onboarding@resend.dev>',
        user.email,
        'welcome to the platform',
        welcomeTemplate(user.firstName),
      );

      this.eventEmitter.emit('user.created', user);
      // Send the response using the Express res object
      return customResponse({
        status: true,
        code: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'Something failed while creating the user.',
          error: error.message,
        }),
      );
    }
  }

  async login(loginDto: LoginDto): Promise<SuccessResponse | ErrorResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'No user was found with given email.',
          error: '',
        }),
      );
    }

    await matchPasswords(password, user.password);
    try {
      const payload: tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await signToken(payload);
      return customResponse({
        status: true,
        code: HttpStatus.OK,
        message: 'User logged in successfully',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        customResponse({
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something failed while logging in',
          error: error.message,
        }),
      );
    }
  }

  async getMe(
    currentUser: UserWithoutPassword,
  ): Promise<SuccessResponse | ErrorResponse> {
    //console.log(currentUser);
    if (!currentUser) {
      throw new BadRequestException(
        customResponse({
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: 'No user was found.',
          error: 'No user was found.',
        }),
      );
    }
    return customResponse({
      status: true,
      code: HttpStatus.OK,
      data: currentUser,
    });
  }
}
