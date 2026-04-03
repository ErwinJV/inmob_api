import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';

import { CommonService } from '../common/common.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PaginationDto } from '../common/dtos/paginator.dto';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';
import { User } from '../users/entities/user.entity';
import { PropertiesDataResponse } from './types/PropertiesDataResponse.type';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyFilterInput } from './dto/property-filter.input';
import { PropertyVideo } from './entities/property-video.entity';
import { PropertyImage360 } from './entities/property-image-360';
import { PropertyVirtualTour } from './entities/property-virtual-tour';
import { RevalidationService } from '../revalidation/revalidation.service';
// import { UploadTestFileInput } from './dto/upload-test-file.input';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly propertyImageRepository: Repository<PropertyImage>,
    @InjectRepository(PropertyVideo)
    private readonly propertyVideoRepository: Repository<PropertyVideo>,
    @InjectRepository(PropertyImage360)
    private readonly propertyImage360Repository: Repository<PropertyImage360>,
    private readonly commonService: CommonService,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(user: User, createPropertyInput: CreatePropertyInput) {
    const { ...propertyDetails } = createPropertyInput;
    console.log({ propertyDetails });
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

    const slug = createPropertyInput.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll(' ', '-')
      .toLowerCase();
    console.log({ createPropertyInput });

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

      const userResponse = await this.propertyRepository.save(property);

      this.revalidationService
        .notifyFrontend('properties', 'CREATE')
        .catch((error) => {
          console.error('Error notifying frontend:', error);
        });

      return userResponse;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PropertiesDataResponse | undefined> {
    const { limit = 0, offset = 0, order = 'DESC' } = paginationDto;

    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    // Inner joins para relaciones ManyToOne (obligatorias)
    queryBuilder.innerJoinAndSelect('property.user', 'user');

    // Cargar las imágenes, pero solo aquellas con url no nula
    // (opcional: si quieres todas las imágenes, omite la tercera condición)
    queryBuilder.leftJoinAndSelect(
      'property.images',
      'images',
      'images.url IS NOT NULL',
    );

    // Subquery EXISTS para verificar que la propiedad tenga al menos una imagen
    // con campos no nulos (por ejemplo, la URL de la imagen)
    const normalizeOrder = order.toUpperCase();
    const existsSubQuery = queryBuilder
      .subQuery()
      .select('1')
      .from('property_image', 'image') // nombre real de la tabla en BD
      // .from(PropertyImage, 'image')        // alternativa si usas la entidad
      .where('image.propertyId = property.id') // ajusta el nombre de la columna FK si es necesario
      .andWhere('image.url IS NOT NULL')
      .getQuery();

    queryBuilder.andWhere(`EXISTS(${existsSubQuery})`);

    // Condiciones para campos propios no nulos (ajusta según tu modelo)
    queryBuilder
      .andWhere('property.title IS NOT NULL')
      .andWhere('property.description IS NOT NULL')
      .andWhere('property.price IS NOT NULL')
      .andWhere('property.main_picture_url IS NOT NULL');

    // Paginación y orden
    queryBuilder
      .take(limit)
      .skip(offset)
      .orderBy('property.id', normalizeOrder as PaginationDto['order']);

    // Obtener resultados y total filtrado
    const [properties, total] = await queryBuilder.getManyAndCount();

    if (!properties || total === 0) {
      throw new NotFoundException(
        'No properties found after filtering null values',
      );
    }
    console.log({ properties });

    return {
      properties,
      total,
    };
  }

  async findAllForUserID(
    paginationDto: PaginationDto,
    userID: string,
  ): Promise<PropertiesDataResponse | undefined> {
    const { limit = 0, offset = 0, order = 'DESC' } = paginationDto;

    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    // Inner joins para relaciones ManyToOne (obligatorias)
    queryBuilder.innerJoinAndSelect('property.user', 'user');

    // Cargar las imágenes, pero solo aquellas con url no nula
    // (opcional: si quieres todas las imágenes, omite la tercera condición)
    queryBuilder.leftJoinAndSelect(
      'property.images',
      'images',
      'images.url IS NOT NULL',
    );

    // Subquery EXISTS para verificar que la propiedad tenga al menos una imagen
    // con campos no nulos (por ejemplo, la URL de la imagen)
    const normalizeOrder = order.toUpperCase();
    const existsSubQuery = queryBuilder
      .subQuery()
      .select('1')
      .from('property_image', 'image') // nombre real de la tabla en BD
      // .from(PropertyImage, 'image')        // alternativa si usas la entidad
      .where('image.propertyId = property.id') // ajusta el nombre de la columna FK si es necesario
      .andWhere('image.url IS NOT NULL')
      .getQuery();

    queryBuilder.andWhere(`EXISTS(${existsSubQuery})`);

    // Condiciones para campos propios no nulos (ajusta según tu modelo)
    queryBuilder
      .andWhere('property.title IS NOT NULL')
      .andWhere('property.description IS NOT NULL')
      .andWhere('property.price IS NOT NULL')
      .andWhere('property.main_picture_url IS NOT NULL');

    // Filtrar por userID
    queryBuilder.andWhere('property.userId = :userId', { userID });

    // Paginación y orden
    queryBuilder
      .take(limit)
      .skip(offset)
      .orderBy('property.id', normalizeOrder as PaginationDto['order']);

    // Obtener resultados y total filtrado
    const [properties, total] = await queryBuilder.getManyAndCount();

    if (!properties || total === 0) {
      throw new NotFoundException(
        'No properties found after filtering null values',
      );
    }
    console.log({ properties });

    return {
      properties,
      total,
    };
  }

  async findAllForDashboard(
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
  }

  async findOneBySlug(slug: string) {
    try {
      const property = await this.propertyRepository.findOne({
        where: {
          slug,
        },
      });

      return property;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async update(id: string, updatePropertyInput: UpdatePropertyInput) {
    try {
      const property = await this.findOne(id);
      if (updatePropertyInput.title) {
        const slug = updatePropertyInput.title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replaceAll(' ', '-')
          .toLowerCase();
        const response = await this.propertyRepository.update(id, {
          ...updatePropertyInput,
          slug,
          updated_at: Date.now(),
        });
        console.log({ slug });

        await this.revalidationService.notifyFrontend('properties', 'UPDATE');
        return response;
      }
      const response = await this.propertyRepository.update(id, {
        ...updatePropertyInput,
        updated_at: Date.now(),
      });
      await this.revalidationService.notifyFrontend(
        'properties',
        'UPDATE',
        property.slug,
      );
      return response;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const property = await this.findOne(id);
      if (property.images?.length) {
        const images = property.images;
        for (const image of images) {
          await this.propertyImageRepository.delete(image);
        }
      }

      if (property.images360?.length) {
        const images360 = property.images360;
        for (const image360 of images360) {
          await this.propertyImage360Repository.delete(image360);
        }
      }

      if (property.videos?.length) {
        const videos = property.videos;
        for (const video of videos) {
          await this.propertyVideoRepository.delete(video);
        }
      }
      const response = await this.propertyRepository.remove(property);
      console.log({ response });
      this.revalidationService
        .notifyFrontend('properties', 'DELETE', property.slug)
        .catch((error) => {
          console.error('Error notifying frontend:', error);
        });

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

  async saveFileUrl(
    createPropertyFileInput: CreatePropertyFileInput,
    url: string,
  ): Promise<
    | PropertyImage
    | PropertyVideo
    | PropertyImage360
    | PropertyVirtualTour
    | undefined
  > {
    try {
      const { property_id, fileType } = createPropertyFileInput;
      const property = await this.findOne(property_id);

      if (fileType === 'image360') {
        const image360 = this.propertyImage360Repository.create({
          property,
          url,
        });

        return await this.propertyImage360Repository.save(image360);
      }

      if (fileType === 'video') {
        const video = this.propertyVideoRepository.create({
          property,
          url,
        });

        return await this.propertyVideoRepository.save(video);
      }

      if (fileType === 'image') {
        const image = this.propertyImageRepository.create({
          property,
          url,
        });

        return await this.propertyImageRepository.save(image);
      }

      if (fileType === 'main_picture_url') {
        await this.propertyRepository.update(property_id, {
          main_picture_url: url,
        });
      }

      // if (fileType === 'virtualTour') {
      //   const virtualTour = this.propertyImageRepository.create({
      //     property,
      //     url: `${FILE_SERVER_SERVICE_URL}/uploads/properties/${property_id}/${fileName}`,
      //   });

      //   return await this.propertyImageRepository.save(virtualTour);
      // }

      throw new BadRequestException(`File type not supported`);
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async deleteFile({
    fileType,
    id,
  }: {
    fileType: CreatePropertyFileInput['fileType'];
    id: string;
  }) {
    try {
      if (fileType === 'image360') {
        const image360 = await this.propertyImage360Repository.findOne({
          where: { id },
        });
        if (!image360) {
          throw new NotFoundException(`Image 360 not exists!`);
        }
        await this.propertyImage360Repository.remove(image360);

        return { url: image360.url };
      }

      if (fileType === 'video') {
        const video = await this.propertyVideoRepository.findOne({
          where: { id },
        });
        if (!video) {
          throw new NotFoundException(`Video not exists!`);
        }
        await this.propertyVideoRepository.remove(video);

        return { url: video.url };
      }

      if (fileType === 'image') {
        const image = await this.propertyImageRepository.findOne({
          where: { id },
        });
        if (!image) {
          throw new NotFoundException(`Image not exists!`);
        }
        await this.propertyImageRepository.remove(image);

        return { url: image.url };
      }

      if (fileType === 'main_picture_url') {
        const property = await this.propertyRepository.findOne({
          where: { id },
        });
        if (!property) {
          throw new NotFoundException(`Property not exists!`);
        }
        const url = property.main_picture_url;
        await this.propertyRepository.update(id, {
          main_picture_url: undefined,
        });

        return { url };
      }
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  isValidFileType(fileType: string, mimeType: string): boolean {
    const validMimeTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      image360: ['image/jpeg', 'image/png'],
    };

    console.log({ fileType });

    return validMimeTypes[fileType]?.includes(mimeType) || false;
  }

  async filterProperties(
    paginationDto: PaginationDto,
    filters: PropertyFilterInput,
  ): Promise<{ total: number; properties: Property[] }> {
    const { limit, offset, order = 'created_at' } = paginationDto;

    console.log({ filters, paginationDto });

    // 1. Construir queryBuilder para Property
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    // 2. Joins obligatorios para cargar relaciones y asegurar que existen
    queryBuilder

      .innerJoinAndSelect('property.user', 'user')
      .leftJoinAndSelect('property.images', 'images', 'images.url IS NOT NULL'); // Solo imágenes con url válida

    // 3. Subquery EXISTS para filtrar propiedades con al menos una imagen válida
    const existsSubQuery = queryBuilder
      .subQuery()
      .select('1')
      .from('property_image', 'img')
      .where('img.propertyId = property.id')
      .andWhere('img.url IS NOT NULL')
      .getQuery();

    queryBuilder.andWhere(`EXISTS(${existsSubQuery})`);

    // 4. Campos propios obligatorios (ajusta según tu modelo)
    queryBuilder
      .andWhere('property.title IS NOT NULL')
      .andWhere('property.description IS NOT NULL')
      .andWhere('property.price IS NOT NULL');

    // 6. Aplicar filtros dinámicos (si existen)

    if (filters.term) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('place ILIKE :term', { term: `%${filters.term}%` })
            .orWhere('title ILIKE :term', { term: `%${filters.term}%` })
            .orWhere('description ILIKE :term', { term: `%${filters.term}%` });
        }),
      );
    }

    if (filters.type) {
      queryBuilder.andWhere('property.type = :type', { type: filters.type });
    }
    if (filters.status) {
      queryBuilder.andWhere('property.status = :status', {
        status: filters.status,
      });
    }
    if (filters.num_bathrooms && filters.num_bathrooms !== 0) {
      queryBuilder.andWhere('property.num_bathrooms = :num_bathrooms', {
        num_bathrooms: filters.num_bathrooms,
      });
    }
    if (filters.num_bedrooms && filters.num_bedrooms !== 0) {
      queryBuilder.andWhere('property.num_bedrooms = :num_bedrooms', {
        num_bedrooms: filters.num_bedrooms,
      });
    }
    if (filters.num_parking_lot && filters.num_parking_lot !== 0) {
      queryBuilder.andWhere('property.num_parking_lot = :num_parking_lot', {
        num_parking_lot: filters.num_parking_lot,
      });
    }

    // Filtro por rango de área
    if (filters.min_area != null || filters.max_area != null) {
      const minArea = filters.min_area ?? 0;
      const maxArea = filters.max_area ?? 2147483647;
      queryBuilder.andWhere('property.area BETWEEN :minArea AND :maxArea', {
        minArea,
        maxArea,
      });
    }

    // 7. Paginación y orden
    queryBuilder
      .take(limit || 10)
      .skip(offset || 0)
      .orderBy(`property.${order}`, 'DESC');

    // 8. Ejecutar consulta
    const [properties, total] = await queryBuilder.getManyAndCount();

    console.log({ total, properties });
    return { total, properties };
  }

  async searchProperties(
    term: string,
    paginationDto: PaginationDto,
  ): Promise<PropertiesDataResponse | undefined> {
    const { limit = 10, offset = 0, order = 'DESC' } = paginationDto;

    if (!term || term.trim().length === 0) {
      throw new BadRequestException(
        'El término de búsqueda no puede estar vacío',
      );
    }

    // Crear el patrón de búsqueda
    const searchPattern = `%${term}%`;

    // Buscar propiedades usando el operador ILike
    const [properties, total] = await this.propertyRepository.findAndCount({
      where: [
        { title: ILike(searchPattern) },
        { description: ILike(searchPattern) },
        { place: ILike(searchPattern) },
      ],
      order: {
        created_at: order === 'DESC' ? 'DESC' : 'ASC',
      },
      take: limit,
      skip: offset,
    });

    if (!properties || properties.length === 0) {
      throw new NotFoundException(
        `No se encontraron propiedades que coincidan con: ${term}`,
      );
    }

    return {
      properties,
      total,
    };
  }
}
