import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { User } from 'src/users/entities/user.entity';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePropertyInput } from './dto/create-property.input';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';

import { PropertyService } from './property.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { CreateMultiplePropertiesInput } from './dto/create-multiple-property-inputs';
import { UsersService } from 'src/users/users.service';
import { PropertiesDataResponse } from './types/PropertiesDataResponse.type';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly userService: UsersService,
  ) {}

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property, {
    name: 'createProperty',
    description:
      'Create a property by createPropertyInput params, authorization bearer token is required in the header request',
  })
  async createProperty(
    @CurrentUser() user: User,
    @Args('createPropertyInput') createPropertyInput: CreatePropertyInput,
  ) {
    return await this.propertyService.create(user, createPropertyInput);
  }

  @Query(() => PropertiesDataResponse, {
    name: 'properties',
    description: 'Returns a paginated list of properties',
  })
  async findAll(
    @Args('paginationDto') paginationDto: PaginationDto,
  ): Promise<PropertiesDataResponse | undefined> {
    return await this.propertyService.findAll(paginationDto);
  }

  @Query(() => Property, {
    name: 'property',
    description:
      'Return a single property by required term (property id or slug)',
  })
  findOne(@Args('term', { type: () => String }) term: string) {
    return this.propertyService.findOne(term);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property, {
    name: 'updateProperty',
    description:
      'Update a single property by updatePropertyInput params and required id, authorization bearer token is required in the header request',
  })
  updateProperty(
    @Args('updatePropertyInput') updatePropertyInput: UpdatePropertyInput,
  ) {
    return this.propertyService.update(
      updatePropertyInput.id,
      updatePropertyInput,
    );
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property, {
    name: 'removeProperty',
    description:
      'Remove a single property by required id, authorization bearer token is required in the header request',
  })
  removeProperty(@Args('id', { type: () => String }) id: string) {
    return this.propertyService.remove(id);
  }

  @Auth(ValidRoles.ADMIN)
  @Mutation(() => [Property], {
    name: 'createMultipleProperties',
    description: 'Creates a multiple fake properties for development testing',
  })
  async createMultipleProperties(
    @CurrentUser() user: User,
    @Args('input')
    input: CreateMultiplePropertiesInput,
  ) {
    return await this.propertyService.createMultipleProperties(
      user,
      input.properties,
    );
  }

  @ResolveField(() => User)
  async user(@Parent() property: Property) {
    return await this.userService.findOne(property.userId);
  }
}
