import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CommonService } from 'src/common/common.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';
import { User } from 'src/users/entities/user.entity';
import { PropertiesDataResponse } from './types/PropertiesDataResponse.type';
import { CreatePropertyFileInput } from './dto/create-property-file.input';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyFilterInput } from './dto/property-filter.input';
import { PropertyVideo } from './entities/property-video.entity';
import { PropertyImage360 } from './entities/property-image-360';
import { PropertyVirtualTour } from './entities/property-virtual-tour';
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
  ) {}

  async create(user: User, createPropertyInput: CreatePropertyInput) {
    const slug = createPropertyInput.title.replaceAll(' ', '-');
    console.log({ createPropertyInput });

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
      const queryBuilder =
        this.propertyRepository.createQueryBuilder('property');

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

      if (!properties || properties.length === 0) {
        throw new NotFoundException(
          'No properties found after filtering null values',
        );
      }
      console.log({ properties });

      return {
        properties,
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

  // private async sendFile(
  //   createPropertyFileInput: CreatePropertyFileInput,
  //   file: Express.Multer.File,
  // ): Promise<string> {
  //   const FILE_SERVER_SERVICE_URL = process.env[
  //     'FILE_SERVER_SERVICE_URL'
  //   ] as string;
  //   const formData = new FormData();
  //   const { property_id } = createPropertyFileInput;
  //   const blob = new Blob([file.buffer as BlobPart], { type: file.mimetype });
  //   formData.append('file', blob);
  //   formData.append('entity', 'properties');
  //   formData.append('entityID', property_id);

  //   const response = await fetch(`${FILE_SERVER_SERVICE_URL}/api/uploads/`, {
  //     body: formData,
  //     method: 'post',
  //   });

  //   const { fileName } = (await response.json()) as unknown as {
  //     fileName: string;
  //   };

  //   return fileName;
  // }

  // async uploadTestFile(
  //   uploadTestFileInput: UploadTestFileInput,
  //   files: Express.Multer.File[],
  // ): Promise<
  //   Array<PropertyImage | PropertyVideo | PropertyImage360> | undefined
  // > {
  //   try {
  //     const results: Array<PropertyImage | PropertyVideo | PropertyImage360> =
  //       [];

  //     for (const file of files) {
  //       // Convertir UploadTestFileInput a CreatePropertyFileInput
  //       const createPropertyFileInput: CreatePropertyFileInput = {
  //         property_id: uploadTestFileInput.property_id,
  //         fileType: uploadTestFileInput.fileType,
  //       };

  //       // Validar tipo de archivo antes de procesar
  //       if (
  //         !this.isValidFileType(uploadTestFileInput.fileType, file.mimetype)
  //       ) {
  //         throw new BadRequestException(
  //           `Invalid file type for ${uploadTestFileInput.fileType}. File: ${file.originalname}`,
  //         );
  //       }

  //       // Reutilizar la función uploadFile original para cada archivo
  //       const result = await this.uploadFile(createPropertyFileInput, file);
  //       if (result) {
  //         results.push(result);
  //       }
  //     }

  //     return results;
  //   } catch (error) {
  //     this.commonService.handleExceptions(error);
  //   }
  // }

  // private generateFileName(originalName: string, fileType: string): string {
  //   const timestamp = Date.now();
  //   const randomString = Math.random().toString(36).substring(2, 15);
  //   const extension = originalName.split('.').pop();
  //   return `${fileType}_${timestamp}_${randomString}.${extension}`;
  // }

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
    if (filters.place) {
      queryBuilder.andWhere({ place: ILike(`%${filters.place}%`) });
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

    try {
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
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }
}
