import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class PaginationDto {
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @Field(() => Int, { nullable: true })
  offset?: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
