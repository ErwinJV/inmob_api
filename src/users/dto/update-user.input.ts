import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => String, {
    description: `User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695". This field is required`,
  })
  id: string;
}
