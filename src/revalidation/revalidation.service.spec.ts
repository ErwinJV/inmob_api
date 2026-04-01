import { Test, TestingModule } from '@nestjs/testing';
import { RevalidationService } from './revalidation.service';

describe('RevalidationService', () => {
  let service: RevalidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevalidationService],
    }).compile();

    service = module.get<RevalidationService>(RevalidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
