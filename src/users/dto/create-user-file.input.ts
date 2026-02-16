import { InputType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateUserFileInput {
  @IsUUID()
  @IsString()
  user_id: string;
}
