import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { PaginationDto } from 'src/common/dtos/paginator.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async users(
    @Args('paginationDto', { type: () => PaginationDto })
    paginationDto: PaginationDto,
  ) {
    return await this.usersService.findAll(paginationDto);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  user(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async removeUser(@Args('id', { type: () => String }) id: string) {
    return await this.usersService.remove(id);
  }
}
