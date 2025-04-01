import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @MaxLength(25)
  name: string;

  @Field(() => String)
  @IsString()
  @MaxLength(25)
  last_name: string;

  @Field(() => String)
  @IsString()
  @MaxLength(25)
  email: string;

  @Field(() => String)
  @IsString()
  @MaxLength(100)
  password: string;

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
