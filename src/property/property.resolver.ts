import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { User } from 'src/users/entities/user.entity';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePropertyInput } from './dto/create-property.input';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';

import { PropertyService } from './property.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property)
  createProperty(
    @CurrentUser() user: User,
    @Args('createPropertyInput') createPropertyInput: CreatePropertyInput,
  ) {
    return this.propertyService.create(user, createPropertyInput);
  }

  @Query(() => [Property], { name: 'properties' })
  async findAll(@Args('paginationDto') paginationDto: PaginationDto) {
    return await this.propertyService.findAll(paginationDto);
  }

  @Query(() => Property, { name: 'property' })
  findOne(@Args('term', { type: () => String }) term: string) {
    return this.propertyService.findOne(term);
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property)
  updateProperty(
    @Args('updatePropertyInput') updatePropertyInput: UpdatePropertyInput,
  ) {
    return this.propertyService.update(
      updatePropertyInput.id,
      updatePropertyInput,
    );
  }

  @Auth(ValidRoles.ADMIN, ValidRoles.EDITOR)
  @Mutation(() => Property)
  removeProperty(@Args('id', { type: () => String }) id: string) {
    return this.propertyService.remove(id);
  }
}
