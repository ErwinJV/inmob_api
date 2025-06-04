import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Property } from '../entities/property.entity';

@ObjectType()
export class PropertiesDataResponse {
  @Field(() => Int)
  total: number;

  @Field(() => [Property])
  properties: Property[];
}
