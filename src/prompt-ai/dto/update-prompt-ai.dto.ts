import { PartialType } from '@nestjs/mapped-types';
import { CreatePromptAiDto } from './create-prompt-ai.dto';

export class UpdatePromptAiDto extends PartialType(CreatePromptAiDto) {}
