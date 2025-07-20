import { Test, TestingModule } from '@nestjs/testing';
import { PromptAiController } from './prompt-ai.controller';
import { PromptAiService } from './prompt-ai.service';

describe('PromptAiController', () => {
  let controller: PromptAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptAiController],
      providers: [PromptAiService],
    }).compile();

    controller = module.get<PromptAiController>(PromptAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
