import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthVerificationResponse {
  @Field(() => Boolean)
  verification: true;
}
