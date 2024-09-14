import { Global, Module } from '@nestjs/common';
import { PaginateService } from './paginate.service';

@Global()
@Module({
  exports: [PaginateService],
  providers: [PaginateService],
})
export class PaginateModule {}
