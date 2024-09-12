import { Module } from '@nestjs/common';
import { PaginateService } from './paginate.service';

@Module({
  exports: [PaginateService],
  providers: [PaginateService],
})
export class PaginateModule {}
