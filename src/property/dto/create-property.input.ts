import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@InputType()
export class CreatePropertyInput {
  @Field(() => String, {
    description: `Property's title, Example: "Apartamento en Buena Vista". This field is required | Maximum character length of 80`,
  })
  @IsString()
  @MaxLength(80)
  title: string;

  @Field(() => PropertyStatus, {
    description: `Property's status. Example: "SALE". This field is required`,
  })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @Field(() => PropertyType, {
    description: `Property's type. Example: "HOUSE". This field is required`,
  })
  @IsEnum(PropertyType)
  type: PropertyType;

  @Field(() => String, {
    description: `Property's place. Example: "Av. Bella Vista Maracaibo, Zulia". This field is required | Maximum character length of 125`,
  })
  @IsString()
  @MaxLength(125)
  place: string;

  @Field(() => Float, { description: 'Property place latitude' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Field(() => Float, { description: 'Property place longitude' })
  @IsNumber()
  @IsOptional()
  long?: number;

  @Field(() => String, {
    description: `Property's description. Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc.". This field is required | Maximum character length of 420 `,
  })
  @IsString()
  @MaxLength(420)
  description: string;

  @Field(() => Int, {
    description: 'Area in square meters of the property',
  })
  @IsNumber()
  @IsPositive()
  @Max(5)
  area: number;

  @Field(() => Float, {
    description: `Property's price. Example: "125000.00". This field is required`,
  })
  @IsNumber()
  price: number;

  @Field(() => Int, {
    description: `Property's total bathrooms. Example: "2"`,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  num_bathrooms?: number;

  @Field(() => Int, {
    description: `Property's total bedrooms. Example: "4"`,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  num_bedrooms?: number;

  @Field(() => Int, {
    description: `Property's total pools. Example: "1"`,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  num_pools?: number;

  @Field(() => Int, {
    description: `Property's total parkings lot. Example: "2"`,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  num_parking_lot?: number;
}
