import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { User } from 'src/users/entities/user.entity';

import { CurrentUser } from './decorators/current-user.decorator';
import { CreatePropertyInput } from './dto/create-property.input';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';

import { PropertyService } from './property.service';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Property)
  createProperty(
    @CurrentUser() user: User,
    @Args('createPropertyInput') createPropertyInput: CreatePropertyInput,
  ) {
    return this.propertyService.create(user, createPropertyInput);
  }

  @Query(() => [Property], { name: 'property' })
  async findAll(paginationDto: PaginationDto) {
    return await this.propertyService.findAll(paginationDto);
  }

  @Query(() => Property, { name: 'property' })
  findOne(@Args('term', { type: () => String }) term: string) {
    return this.propertyService.findOne(term);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Property)
  updateProperty(
    @Args('updatePropertyInput') updatePropertyInput: UpdatePropertyInput,
  ) {
    return this.propertyService.update(
      updatePropertyInput.id,
      updatePropertyInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Property)
  removeProperty(@Args('id', { type: () => String }) id: string) {
    return this.propertyService.remove(id);
  }
}
