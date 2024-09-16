import { Module } from '@nestjs/common';
import { StoreCategoriesService } from './store-categories.service';
import { StoreCategoriesController } from './store-categories.controller';
import { StoresModule } from 'src/stores/stores.module';

@Module({
  controllers: [StoreCategoriesController],
  providers: [StoreCategoriesService],
  imports: [StoresModule],
})
export class StoreCategoriesModule {}
