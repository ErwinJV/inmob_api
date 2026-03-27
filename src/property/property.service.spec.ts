import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { CommonService } from '../common/common.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { PropertyImage360 } from './entities/property-image-360';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyVideo } from './entities/property-video.entity';
import { Property } from './entities/property.entity';

import { PropertyType } from './enums/property-type.enum';
import { PropertyStatus } from './enums/property-status.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePropertyInput } from './dto/create-property.input';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/paginator.dto';
import { PropertyFilterInput } from './dto/property-filter.input';
// Mock de los repositorios
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    subQuery: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnValue('EXISTS subquery'),
    })),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  })),
};

describe('PropertyService', () => {
  let service: PropertyService;

  let propertyRepository: Repository<Property>;
  let propertyImageRepository: Repository<PropertyImage>;
  let propertyVideoRepository: Repository<PropertyVideo>;
  let propertyImage360Repository: Repository<PropertyImage360>;
  let commonService: CommonService;

  // Mock de usuario
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    // ... otros campos necesarios
    is_active: true,
    created_at: Date.now(),
    updated_at: Date.now(),
    password: 'HolaChao123',
    name: 'Erwin',
    last_name: 'Jimenez',
    roles: ['ADMIN'],
  };

  // Mock de propiedad
  const mockProperty: Property = {
    id: 'property-123',
    title: 'Test Property',
    slug: 'test-property',
    description: 'Test Description',
    type: PropertyType.APARTMENT,
    status: PropertyStatus.RENT,
    place: 'Test City',
    price: 100000,
    userId: mockUser.id,
    created_at: Date.now(),
    updated_at: Date.now(),
    area: 10000,
    user: mockUser,

    // ... otros campos
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,

        {
          provide: getRepositoryToken(Property),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(PropertyImage),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(PropertyVideo),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(PropertyImage360),
          useValue: { ...mockRepository },
        },
        {
          provide: CommonService,
          useValue: {
            handleExceptions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    propertyImageRepository = module.get<Repository<PropertyImage>>(
      getRepositoryToken(PropertyImage),
    );
    propertyVideoRepository = module.get<Repository<PropertyVideo>>(
      getRepositoryToken(PropertyVideo),
    );
    propertyImage360Repository = module.get<Repository<PropertyImage360>>(
      getRepositoryToken(PropertyImage360),
    );
    commonService = module.get<CommonService>(CommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPropertyInput = {
      title: 'Casona histórica restaurada',
      description: 'A beautiful house in the city',
      type: PropertyType.APARTMENT,
      status: PropertyStatus.RENT,
      place: 'New York',
      price: 500000,
      num_bedrooms: 3,
      num_bathrooms: 2,
      area: 150,
    };

    it('should create a property successfully', async () => {
      const expectedSlug = 'casona-historica-restaurada';
      // const expectedProperty = {
      //   ...createPropertyInput,
      //   slug: expectedSlug,
      //   userId: mockUser.id,
      //   created_at: expect.any(Number) as unknown as number,
      //   updated_at: expect.any(Number) as unknown as number,
      // };

      const createSpy = jest
        .spyOn(propertyRepository, 'create')
        .mockReturnValue(mockProperty);
      const saveSpy = jest
        .spyOn(propertyRepository, 'save')
        .mockResolvedValue(mockProperty);

      const result = await service.create(mockUser, createPropertyInput);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createPropertyInput,
          slug: expectedSlug,
          userId: mockUser.id,
        }),
      );
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockProperty);
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const invalidInput = {
        ...createPropertyInput,
      } as Partial<CreatePropertyInput>;
      delete invalidInput.title;

      await expect(
        service.create(mockUser, invalidInput as CreatePropertyInput),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(propertyRepository, 'create').mockReturnValue(mockProperty);
      jest.spyOn(propertyRepository, 'save').mockRejectedValue(error);

      await service.create(mockUser, createPropertyInput);
      expect(commonService.handleExceptions).toHaveBeenCalledWith(error);
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = {
      limit: 10,
      offset: 0,
      order: 'DESC',
    };

    it('should return paginated properties', async () => {
      const mockProperties = [mockProperty];
      const mockTotal = 1;
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        subQuery: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('EXISTS subquery'),
        })),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockProperties, mockTotal]),
      };

      jest
        .spyOn(propertyRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual({
        properties: mockProperties,
        total: mockTotal,
      });
    });

    it('should throw NotFoundException when no properties found', async () => {
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        subQuery: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('EXISTS subquery'),
        })),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      jest
        .spyOn(propertyRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should find property by id', async () => {
      const findOneSpy = jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValue(mockProperty);

      const result = await service.findOne('property-123');

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 'property-123' },
      });
      expect(result).toEqual(mockProperty);
    });

    it('should find property by slug when id not found', async () => {
      const findOneSpy = jest
        .spyOn(propertyRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProperty);

      const result = await service.findOne('test-property');

      expect(findOneSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProperty);
    });

    it('should throw NotFoundException when property not found', async () => {
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchProperties', () => {
    const paginationDto: PaginationDto = {
      limit: 10,
      offset: 0,
      order: 'DESC',
    };

    it('should search properties by term', async () => {
      const searchTerm = 'house';
      const mockProperties = [mockProperty];
      const mockTotal = 1;

      const spyFindAndCount = jest
        .spyOn(propertyRepository, 'findAndCount')
        .mockResolvedValue([mockProperties, mockTotal]);

      const result = await service.searchProperties(searchTerm, paginationDto);

      console.log({ result });

      expect(spyFindAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        properties: mockProperties,
        total: mockTotal,
      });
    });

    it('should throw BadRequestException when search term is empty', async () => {
      await expect(service.searchProperties('', paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when no results found', async () => {
      jest.spyOn(propertyRepository, 'findAndCount').mockResolvedValue([[], 0]);

      await expect(
        service.searchProperties('nonexistent', paginationDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterProperties', () => {
    const paginationDto: PaginationDto = {
      limit: 10,
      offset: 0,
      order: 'DESC',
    };

    const filters: PropertyFilterInput = {
      type: PropertyType.HOUSE,
      status: PropertyStatus.SALE,
      min_area: 100,
      max_area: 200,
      num_bedrooms: 3,
    };

    it('should filter properties with criteria', async () => {
      const mockProperties = [mockProperty];
      const mockTotal = 1;
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        subQuery: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('EXISTS subquery'),
        })),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockProperties, mockTotal]),
      };

      jest
        .spyOn(propertyRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.filterProperties(paginationDto, filters);

      expect(result).toEqual({
        total: mockTotal,
        properties: mockProperties,
      });
    });
  });
});
