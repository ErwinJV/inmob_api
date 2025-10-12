import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PropertyService } from './property.service';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { UserRoleGuard } from 'src/auth/guards/validate-role.guard';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('upload-file')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.EDITOR, ValidRoles.USER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() createPropertyFileInput: CreatePropertyFileInput,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log({ createPropertyFileInput });
    if (!file) throw new BadRequestException(`File is undefined`);

    return await this.propertyService.uploadFile(createPropertyFileInput, file);
  }

  @Delete('delete-file/:entity/:id/:fileName')
  async deleteFile(
    @Param()
    { entity, fileName, id }: { entity: string; id: string; fileName: string },
  ) {
    return await this.propertyService.deleteFile({ entity, fileName, id });
  }
}
