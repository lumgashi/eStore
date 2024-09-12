import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { customResponse } from 'src/utils/functions/customResponse';
//import { getCustomResponse } from 'src/utils/functions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Handle any error thrown by the authentication process
    if (err || !user) {
      throw (
        new BadRequestException(
          customResponse({
            code: HttpStatus.BAD_REQUEST,
            status: false,
            error: err,
            message: 'Token is not valid',
            token_expired: true,
          }),
        ) ||
        new UnauthorizedException(
          customResponse({
            status: false,
            error: 'Unauthorized user',
            token_expired: true,
            message: 'Token is not valid',
            code: HttpStatus.UNAUTHORIZED,
          }),
        )
      );
    }
    return user;
  }
}
