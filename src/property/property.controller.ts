import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PropertyService } from './property.service';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../common/enums/valid-roles.enum';
import { UserRoleGuard } from '../auth/guards/validate-role.guard';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user-controller.decorator';

@Controller('property')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-file')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.AGENT)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: User,
    @Body() createPropertyFileInput: CreatePropertyFileInput,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              'image/jpeg|image/png|image/jpg|image/webp|video/mp4|video/webm',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException(`File is undefined`);
    if (user.roles.includes('AGENT')) {
      const property = await this.propertyService.findOne(
        createPropertyFileInput.property_id,
      );
      if (property.userId !== user.id) {
        throw new BadRequestException(
          `You don't have permissions to upload files for this property!`,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { secure_url } = await this.cloudinaryService.uploadFile(file);

    return this.propertyService.saveFileUrl(
      createPropertyFileInput,
      secure_url as unknown as string,
    );
  }

  // @Post('upload-files')
  // @UseInterceptors(FilesInterceptor('files', 40)) // Máximo 10 archivos
  // async uploadTestFiles(
  //   @Body() uploadTestFileInput: UploadTestFileInput,
  //   @UploadedFiles() files: Express.Multer.File[],
  // ) {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('At least one file is required');
  //   }

  //   // Validar que todos los archivos sean del tipo correcto
  //   for (const file of files) {
  //     const isValid = this.propertyService.isValidFileType(
  //       uploadTestFileInput.fileType,
  //       file.mimetype,
  //     );

  //     if (!isValid) {
  //       throw new BadRequestException(
  //         `Invalid file type for ${uploadTestFileInput.fileType} in file: ${file.originalname}`,
  //       );
  //     }
  //   }

  //   return await this.propertyService.uploadTestFile(
  //     uploadTestFileInput,
  //     files,
  //   );
  // }

  @Delete('delete-file/:fileType/:id')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @UseGuards(AuthGuard(), UserRoleGuard)
  async deleteFile(
    @Param()
    {
      fileType,
      id,
    }: {
      fileType: CreatePropertyFileInput['fileType'];
      id: string;
    },
  ) {
    const deleteResponse = await this.propertyService.deleteFile({
      fileType,
      id,
    });
    const url = deleteResponse?.url;
    if (url) {
      return await this.cloudinaryService.deleteFile(url);
    } else {
      throw new BadRequestException(
        `File URL not found in remote storage for deletion`,
      );
    }
  }
}
