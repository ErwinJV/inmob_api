import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@InputType()
export class CreatePropertyInput {
  @Field(() => String)
  @IsString()
  @MaxLength(90)
  title: string;

  @Field(() => PropertyStatus)
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @Field(() => PropertyType)
  @IsEnum(PropertyType)
  type: PropertyType;

  @Field(() => String)
  @IsString()
  @MaxLength(125)
  place: string;

  @Field(() => String)
  @IsString()
  @MaxLength(420)
  description: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  long?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  num_bathrooms?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  num_bedrooms?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  num_pools?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  num_parking_lot?: number;
}
