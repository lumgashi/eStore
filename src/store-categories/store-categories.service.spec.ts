import { Test, TestingModule } from '@nestjs/testing';
import { StoreCategoriesService } from './store-categories.service';
import { PaginateService } from '../paginate/paginate.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StoreCategoriesService', () => {
  let service: StoreCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreCategoriesService, PrismaService, PaginateService],
    }).compile();

    service = module.get<StoreCategoriesService>(StoreCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
