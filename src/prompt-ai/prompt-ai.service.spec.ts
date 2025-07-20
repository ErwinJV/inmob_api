import { Test, TestingModule } from '@nestjs/testing';
import { PromptAiService } from './prompt-ai.service';

describe('PromptAiService', () => {
  let service: PromptAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptAiService],
    }).compile();

    service = module.get<PromptAiService>(PromptAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
