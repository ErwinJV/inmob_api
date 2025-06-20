import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PropertyService } from './property.service';
import { CreatePropertyFileInput } from './dto/create-property-file.input';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() createPropertyFileInput: CreatePropertyFileInput,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException(`File is undefined`);

    return await this.propertyService.uploadFile(createPropertyFileInput, file);
  }

  @Delete('delete-file')
  async deleteFile(
    @Param()
    { entity, fileName, id }: { entity: string; id: string; fileName: string },
  ) {
    return await this.propertyService.deleteFile({ entity, fileName, id });
  }
}
