import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { PaginationDto } from 'src/common/dtos/paginator.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  //@Auth(ValidRoles.ADMIN)
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Auth(ValidRoles.ADMIN)
  @Query(() => [User], { name: 'users' })
  async users(
    @Args('paginationDto', { type: () => PaginationDto })
    paginationDto: PaginationDto,
  ) {
    return await this.usersService.findAll(paginationDto);
  }

  @Auth(ValidRoles.ADMIN)
  @Query(() => User, { name: 'user' })
  user(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => User)
  async removeUser(@Args('id', { type: () => String }) id: string) {
    return await this.usersService.remove(id);
  }
}
