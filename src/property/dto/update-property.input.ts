import { IsUUID } from 'class-validator';
import { CreatePropertyInput } from './create-property.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => ID, {
    description: `User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695". This field is required`,
  })
  @IsUUID()
  id: string;
}
