import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommonService } from 'src/common/common.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';
import { User } from 'src/users/entities/user.entity';
import { PropertiesDataResponse } from './types/PropertiesDataResponse.type';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly commonService: CommonService,
  ) {}

  async create(user: User, createPropertyInput: CreatePropertyInput) {
    const slug = createPropertyInput.title.replaceAll(' ', '-');

    const date = Date.now();
    console.log(user);
    try {
      const property = this.propertyRepository.create({
        ...createPropertyInput,
        slug,
        userId: user.id,
        created_at: date,
        updated_at: date,
      });

      return await this.propertyRepository.save(property);
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PropertiesDataResponse | undefined> {
    const { limit = 0, offset = 0, order = 'DESC' } = paginationDto;
    try {
      const total = await this.propertyRepository.count();
      const properties = await this.propertyRepository.find({
        order: {
          id: {
            direction: order,
          },
        },
        take: limit,
        skip: offset,
      });

      if (!properties || properties.length === 0) {
        throw new NotFoundException('Properties table are empty');
      }

      return {
        properties: properties,
        total,
      };
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async findOne(term: string) {
    let property: Property | null;
    try {
      const propertyById = await this.propertyRepository.findOne({
        where: {
          id: term,
        },
      });

      if (!propertyById) {
        property = await this.propertyRepository.findOne({
          where: {
            slug: term,
          },
        });
      } else {
        property = propertyById;
      }

      if (!property) {
        throw new NotFoundException(`User with term: ${term} not found`);
      }

      return property;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async update(id: string, updatePropertyInput: UpdatePropertyInput) {
    try {
      await this.findOne(id);
      return await this.propertyRepository.update(id, {
        ...updatePropertyInput,
        updated_at: Date.now(),
      });
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const property = (await this.findOne(id)) as Property;
      return await this.propertyRepository.remove(property);
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async createMultipleProperties(
    user: User,
    createPropertyInputs: CreatePropertyInput[],
  ): Promise<CreatePropertyInput[] | undefined> {
    const properties: CreatePropertyInput[] = [];
    try {
      for (const createPropertyInput of createPropertyInputs) {
        const property = await this.create(user, createPropertyInput);
        if (property) {
          properties.push(property);
        }
      }
      return properties;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async countProperties(): Promise<number> {
    return await this.propertyRepository.count();
  }
}
