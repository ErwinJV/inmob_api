import { IsString } from 'class-validator';

export class CreatePromptAiDto {
  @IsString()
  message: string;
}
