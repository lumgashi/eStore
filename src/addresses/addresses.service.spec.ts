import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaginateService } from '../paginate/paginate.service';

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesService, PrismaService, PaginateService],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
