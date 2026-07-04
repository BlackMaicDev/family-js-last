import { Test, TestingModule } from '@nestjs/testing';
import { PrismaNurseService } from './prisma-nurse.service';

describe('PrismaNurseService', () => {
  let service: PrismaNurseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaNurseService],
    }).compile();

    service = module.get<PrismaNurseService>(PrismaNurseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
