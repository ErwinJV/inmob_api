import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyType } from '../enums/property-type.enum';

@InputType()
export class PropertyFilterInput {
  @Field(() => String, { nullable: true })
  place?: string;

  @Field(() => PropertyType, { nullable: true })
  type?: PropertyType;

  @Field(() => PropertyStatus, { nullable: true })
  status?: PropertyStatus;

  @Field(() => Int, { nullable: true })
  num_bathrooms?: number;

  @Field(() => Int, { nullable: true })
  num_bedrooms?: number;

  @Field(() => Int, { nullable: true })
  num_parking_lot?: number;

  @Field(() => Float, { nullable: true })
  min_area?: number;

  @Field(() => Float, { nullable: true })
  max_area?: number;
}
