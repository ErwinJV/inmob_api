import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UploadTestFileInput {
  @IsUUID()
  @IsString()
  property_id: string;

  @IsString()
  @IsNotEmpty()
  fileType: 'image' | 'video' | 'image360';
}
