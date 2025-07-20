import { Module } from '@nestjs/common';
import { PromptAiService } from './prompt-ai.service';
import { PromptAiController } from './prompt-ai.controller';
import { PropertyModule } from 'src/property/property.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PromptAiController],
  imports: [PropertyModule, UsersModule],
  providers: [PromptAiService],
  exports: [PromptAiModule],
})
export class PromptAiModule {}
