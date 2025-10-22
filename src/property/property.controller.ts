import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { PropertyService } from './property.service';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { UserRoleGuard } from 'src/auth/guards/validate-role.guard';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { UploadTestFileInput } from './dto/upload-test-file.input';

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

  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  async uploadTestFiles(
    @Body() uploadTestFileInput: UploadTestFileInput,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Validar que todos los archivos sean del tipo correcto
    for (const file of files) {
      const isValid = this.propertyService.isValidFileType(
        uploadTestFileInput.fileType,
        file.mimetype,
      );

      if (!isValid) {
        throw new BadRequestException(
          `Invalid file type for ${uploadTestFileInput.fileType} in file: ${file.originalname}`,
        );
      }
    }

    return await this.propertyService.uploadTestFile(
      uploadTestFileInput,
      files,
    );
  }

  @Delete('delete-file/:entity/:id/:fileName')
  async deleteFile(
    @Param()
    { entity, fileName, id }: { entity: string; id: string; fileName: string },
  ) {
    return await this.propertyService.deleteFile({ entity, fileName, id });
  }
}
