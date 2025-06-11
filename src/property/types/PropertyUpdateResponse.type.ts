import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PropertyUpdateResponse {
  @Field(() => Int, { nullable: true })
  affected?: number | undefined;
}
