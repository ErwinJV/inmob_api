import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommonService } from 'src/common/common.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';
import { User } from 'src/users/entities/user.entity';
import { PropertiesDataResponse } from './types/PropertiesDataResponse.type';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { PropertyImage } from './entities/property-image.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepository: Repository<PropertyImage>,
    private readonly commonService: CommonService,
  ) {}

  async create(user: User, createPropertyInput: CreatePropertyInput) {
    const slug = createPropertyInput.title.replaceAll(' ', '-');

    const { ...propertyDetails } = createPropertyInput;

    if (
      !propertyDetails.title ||
      !propertyDetails.description ||
      !propertyDetails.type ||
      !propertyDetails.status ||
      !propertyDetails.place
    ) {
      throw new BadRequestException(
        `Some of the not-null values (title,description,type,status,place) of createUserInput is undefined`,
      );
    }

    const date = Date.now();
    console.log(user);
    try {
      const property = this.propertyRepository.create({
        ...propertyDetails,
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
      const response = await this.propertyRepository.update(id, {
        ...updatePropertyInput,
        updated_at: Date.now(),
      });
      return response;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }
  async remove(id: string) {
    try {
      const property = (await this.findOne(id)) as Property;
      const response = await this.propertyRepository.remove(property);
      console.log({ response });
      return response;
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

  async uploadFile(
    createPropertyFileInput: CreatePropertyFileInput,
    file: Express.Multer.File,
  ): Promise<PropertyImage | undefined> {
    try {
      const fileName = await this.sendFile(createPropertyFileInput, file);
      const { property_id } = createPropertyFileInput;
      const property = await this.findOne(property_id);

      const image = this.propertyImageRepository.create({
        property,
        url: `http://localhost:8080/uploads/properties/${property_id}/${fileName}`,
      });

      return await this.propertyImageRepository.save(image);
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async deleteFile({
    entity,
    fileName,
    id,
  }: {
    entity: string;
    id: string;
    fileName: string;
  }) {
    try {
      const url = `http://localhost:8080/uploads/${entity}/${id}/${fileName}`;
      const deleteUrl = `${process.env['FILE_SERVER_SERVICE_URL']}/api/uploads/${entity}/${id}/${fileName}`;
      await fetch(deleteUrl, {
        method: 'delete',
      });
      const image = await this.propertyImageRepository.findOne({
        where: { url },
      });
      if (!image) {
        throw new NotFoundException(`Image not exists!`);
      }
      await this.propertyImageRepository.remove(image);

      return { msg: 'File deleted' };
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  private async sendFile(
    createPropertyFileInput: CreatePropertyFileInput,
    file: Express.Multer.File,
  ): Promise<string> {
    const formData = new FormData();
    const { property_id } = createPropertyFileInput;
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob);
    formData.append('entity', 'properties');
    formData.append('entityID', property_id);

    const response = await fetch(`http://localhost:8080/api/uploads/`, {
      body: formData,
      method: 'post',
    });

    const { fileName } = (await response.json()) as unknown as {
      fileName: string;
    };

    return fileName;
  }
}
