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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleProtected } from 'src/auth/decorators/role-protected.decorator';
import { UserRoleGuard } from 'src/auth/guards/validate-role.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

import { CreateUserFileInput } from './dto/create-user-file.input';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UsersService,
  ) {}

  @Post('upload-profile-picture')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.EDITOR, ValidRoles.USER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() createUserFileInput: CreateUserFileInput,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException(`File is undefined`);
    console.log('Profile Photo: ', file);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { secure_url } = await this.cloudinaryService.uploadFile(file);
    const { user_id } = createUserFileInput;
    const user = await this.userService.findOne(user_id);
    if (!user)
      throw new BadRequestException(`User with id ${user_id} not found`);
    if (user.profile_picture_url) {
      await this.cloudinaryService.deleteFile(user.profile_picture_url);
    }
    return await this.userService.update(user_id, {
      profile_picture_url: secure_url as unknown as string,
      id: user_id,
    });
  }

  @Delete('delete-file/:url')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @UseGuards(AuthGuard(), UserRoleGuard)
  async deleteFile(
    @Param()
    { url }: { url: string },
  ) {
    return await this.cloudinaryService.deleteFile(url);
  }
}
