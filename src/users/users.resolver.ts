import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { UsersDataResponse } from './types/UsersDataResponse.type';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => User, {
    name: 'createUser',
    description:
      'Create a user by createUserInput params, authorization bearer token is required in the header request',
  })
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Auth(ValidRoles.ADMIN)
  @Query(() => UsersDataResponse, {
    name: 'users',
    description:
      'Return a paginated list of users, authorization bearer token is required in the header request',
  })
  async users(
    @Args('paginationDto', { type: () => PaginationDto })
    paginationDto: PaginationDto,
  ): Promise<UsersDataResponse | undefined> {
    return await this.usersService.findAll(paginationDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Query(() => User, {
    name: 'user',
    description: `Return a single user required by id (uuid), authorization bearer token is required in the header request`,
  })
  user(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => User, {
    name: 'updateUser',
    description:
      'Update a single user by updateUserParams and required id (uuid), authorization bearer token is required in the header request',
  })
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => User, {
    name: 'removeUser',
    description:
      'Remove a single user required by a required id (uuid), authorization bearer token is required in the header request',
  })
  async removeUser(@Args('id', { type: () => String }) id: string) {
    return await this.usersService.remove(id);
  }
}
