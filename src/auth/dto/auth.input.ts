import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AuthInput {
  @Field(() => String, {
    description: `User's email, Example: "example@email.com". This field is required | Maximum character length of 25 | Must be unique`,
  })
  email: string;

  @Field(() => String, {
    description: `User's password, Example: "Ghw~j'#>£F|A7FN=OS:6=/q27". This field is required | Maximum character length of 40`,
  })
  password: string;
}
