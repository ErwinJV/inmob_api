import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String, {
    description: `User's name, Example: "John". This field is required | Maximum character length of 25 `,
  })
  @IsString()
  @MaxLength(25)
  name: string;

  @Field(() => String, {
    description: `User's last name, Example: "Walker". This field is required | Maximum character length of 25`,
  })
  @IsString()
  @MaxLength(25)
  last_name: string;

  @Field(() => String, {
    description: `User's email, Example: "example@email.com". This field is required | Maximum character length of 25 | Must be unique`,
  })
  @IsString()
  @MaxLength(25)
  email: string;

  @Field(() => String, {
    description: `User's password, Example: "Ghw~j'#>£F|A7FN=OS:6=/q27". This field is required | Maximum character length of 40`,
  })
  @IsString()
  @MaxLength(100)
  password: string;

  @Field(() => [String], {
    description: `User's roles, example: "['ADMIN',"USER']". This value is optional | If no value is provided, its default value will be "['USER']"`,
    nullable: true,
  })
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @Field(() => String, {
    description: `User's profile picture URL. Example: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg". This value is optional`,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  profile_picture_url?: string;
}
