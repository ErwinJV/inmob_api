import { InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreatePropertyFileInput {
  @IsUUID()
  @IsString()
  property_id: string;

  @IsString()
  fileType: 'image' | 'video' | 'image360';
}
