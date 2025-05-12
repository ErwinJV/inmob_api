import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field(() => String, {
    description: `Bearer token response, add this in your header request for several requests`,
  })
  access_token: string;
}
