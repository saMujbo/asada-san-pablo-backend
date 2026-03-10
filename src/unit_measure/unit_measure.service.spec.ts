import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnitMeasureService } from './unit_measure.service';
import { UnitMeasure } from './entities/unit_measure.entity';
import { ProductService } from 'src/product/product.service';

describe('UnitMeasureService', () => {
  let service: UnitMeasureService;
  let unitRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let productService: {
    isOnUnit: jest.Mock;
  };

  beforeEach(async () => {
    unitRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    productService = {
      isOnUnit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitMeasureService,
        {
          provide: getRepositoryToken(UnitMeasure),
          useValue: unitRepo,
        },
        {
          provide: ProductService,
          useValue: productService,
        },
      ],
    }).compile();

    service = module.get<UnitMeasureService>(UnitMeasureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('blocks deactivation when the unit measure has associated products', async () => {
    unitRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Kilogramo',
      IsActive: true,
    });
    productService.isOnUnit.mockResolvedValue(true);

    await expect(service.update(1, { IsActive: false })).rejects.toThrow(
      BadRequestException,
    );

    expect(productService.isOnUnit).toHaveBeenCalledWith(1);
    expect(unitRepo.save).not.toHaveBeenCalled();
  });

  it('soft deletes the unit measure when it has no associated products', async () => {
    const unitMeasure = {
      Id: 1,
      Name: 'Kilogramo',
      IsActive: true,
    };

    unitRepo.findOne.mockResolvedValue(unitMeasure);
    productService.isOnUnit.mockResolvedValue(false);
    unitRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.remove(1);

    expect(result.IsActive).toBe(false);
    expect(unitRepo.save).toHaveBeenCalledWith(unitMeasure);
  });

  it('reactivates an inactive unit measure', async () => {
    const unitMeasure = {
      Id: 1,
      Name: 'Kilogramo',
      IsActive: false,
    };

    unitRepo.findOne.mockResolvedValue(unitMeasure);
    unitRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.reactivate(1);

    expect(result.IsActive).toBe(true);
    expect(unitRepo.save).toHaveBeenCalledWith(unitMeasure);
  });

  it('throws when trying to reactivate a missing unit measure', async () => {
    unitRepo.findOne.mockResolvedValue(null);

    await expect(service.reactivate(99)).rejects.toThrow(ConflictException);
  });

  it('blocks creation when the unit measure name already exists', async () => {
    unitRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Kilogramo',
      IsActive: true,
    });

    await expect(service.create({ Name: 'Kilogramo' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('returns paginated search results with category-style meta', async () => {
    const data = [{ Id: 1, Name: 'Kilogramo', IsActive: true }];
    const qb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };

    unitRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.search({ page: 1, limit: 10, q: 'kilo', state: true });

    expect(qb.orderBy).toHaveBeenCalledWith('unitMeasure.Name', 'ASC');
    expect(qb.andWhere).toHaveBeenCalledWith('LOWER(unitMeasure.Name) LIKE :term', {
      term: '%kilo%',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('unitMeasure.IsActive = :state', {
      state: true,
    });
    expect(result).toEqual({
      data,
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });
});
