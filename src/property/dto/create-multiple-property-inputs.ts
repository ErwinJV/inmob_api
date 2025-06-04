import { InputType, Field } from '@nestjs/graphql';

import { CreatePropertyInput } from './create-property.input';

@InputType()
export class CreateMultiplePropertiesInput {
  @Field(() => [CreatePropertyInput])
  properties: CreatePropertyInput[];
}
