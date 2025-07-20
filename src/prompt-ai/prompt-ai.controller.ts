import { Controller, Post, Body } from '@nestjs/common';
import { PromptAiService } from './prompt-ai.service';
import { CreatePromptAiDto } from './dto/create-prompt-ai.dto';

@Controller('prompt-ai')
export class PromptAiController {
  constructor(private readonly promptAiService: PromptAiService) {}

  @Post('message-to-property')
  parseMessageToProperty(@Body() createPromptAiDto: CreatePromptAiDto) {
    return this.promptAiService.parseMessageToProperty(createPromptAiDto);
  }
}
