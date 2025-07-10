import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @MaxLength(25)
  table: string;

  @IsString()
  @IsUUID()
  rowID: string;
}
