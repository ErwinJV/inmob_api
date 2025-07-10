import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserUpdateResponse {
  @Field(() => Int, { nullable: true })
  affected?: number | undefined;
}
