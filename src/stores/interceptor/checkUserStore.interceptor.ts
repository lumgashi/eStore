import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { customResponse } from 'src/utils/functions/customResponse';

@Injectable()
export class StoreExistsInterceptor implements NestInterceptor {
  constructor(private readonly prismaService: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Check if the user has created a store
    const store = await this.prismaService.store.findUnique({
      where: { creatorId: user.id },
    });

    if (!store) {
      throw new ForbiddenException(
        customResponse({
          status: false,
          code: HttpStatus.FORBIDDEN,
          message: 'You have not created a store',
          error: 'You have not created a store',
        }),
      );
    }
    request.store = store;
    return next.handle();
  }
}
