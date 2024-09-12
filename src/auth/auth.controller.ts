import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { UserRole } from 'src/utils/types/user-roles';
import { Roles, ReqUser } from './decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { RolesGuard } from './guards/roles.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Register new user
   * @route       POST /api/auth/register'.
   * @access      Public
   */
  @Post('register')
  async register(@Body() createUser: CreateUserDto) {
    return this.authService.register(createUser);
  }

  /**
   * @description Login user
   * @route       POST /api/auth/login'.
   * @access      Public
   */
  @Post('login')
  async login(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  /**
   * @description Get currect logedin user
   * @route       POST /api/auth/get-me'.
   * @access      Private [User]
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('get-me')
  async getMe(@ReqUser() currentUser: User) {
    return this.authService.getMe(currentUser);
  }
}
