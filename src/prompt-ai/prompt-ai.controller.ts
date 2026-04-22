import { Controller, Post, Body } from '@nestjs/common';
import { PromptAiService } from './prompt-ai.service';
import { CreatePromptAiDto } from './dto/create-prompt-ai.dto';

import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { ValidRoles } from '../common/enums/valid-roles.enum';
import { UserRoleGuard } from '../auth/guards/validate-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';

@Controller('prompt-ai')
export class PromptAiController {
  constructor(private readonly promptAiService: PromptAiService) {}

  @Post('message-to-property')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.AGENT)
  @UseGuards(AuthGuard(), UserRoleGuard)
  parseMessageToProperty(@Body() createPromptAiDto: CreatePromptAiDto) {
    return this.promptAiService.parseMessageToProperty(createPromptAiDto);
  }
}
