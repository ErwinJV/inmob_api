import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UsersDataResponse {
  @Field(() => Int, {
    description: `Total users registered in the database, this data is useful for pagination`,
  })
  total: number;

  @Field(() => [User], { description: `Users, paginated by default in 10` })
  users: User[];
}
