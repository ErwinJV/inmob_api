import { IsUUID } from 'class-validator';
import { CreatePropertyInput } from './create-property.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => String)
  @IsUUID()
  id: string;
}
