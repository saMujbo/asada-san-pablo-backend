import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { Material } from './entities/material.entity';
import { ProductService } from 'src/product/product.service';

describe('MaterialService', () => {
  let service: MaterialService;
  let materialRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let productService: {
    isOnMaterial: jest.Mock;
  };

  beforeEach(async () => {
    materialRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    productService = {
      isOnMaterial: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        {
          provide: getRepositoryToken(Material),
          useValue: materialRepo,
        },
        {
          provide: ProductService,
          useValue: productService,
        },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('blocks deactivation when the material has associated products', async () => {
    materialRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Acero',
      IsActive: true,
    });
    productService.isOnMaterial.mockResolvedValue(true);

    await expect(service.update(1, { IsActive: false })).rejects.toThrow(
      BadRequestException,
    );

    expect(productService.isOnMaterial).toHaveBeenCalledWith(1);
    expect(materialRepo.save).not.toHaveBeenCalled();
  });

  it('soft deletes the material when it has no associated products', async () => {
    const material = {
      Id: 1,
      Name: 'Acero',
      IsActive: true,
    };

    materialRepo.findOne.mockResolvedValue(material);
    productService.isOnMaterial.mockResolvedValue(false);
    materialRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.remove(1);

    expect(result.IsActive).toBe(false);
    expect(materialRepo.save).toHaveBeenCalledWith(material);
  });

  it('reactivates an inactive material', async () => {
    const material = {
      Id: 1,
      Name: 'Acero',
      IsActive: false,
    };

    materialRepo.findOne.mockResolvedValue(material);
    materialRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.reactivate(1);

    expect(result.IsActive).toBe(true);
    expect(materialRepo.save).toHaveBeenCalledWith(material);
  });

  it('throws when trying to reactivate a missing material', async () => {
    materialRepo.findOne.mockResolvedValue(null);

    await expect(service.reactivate(99)).rejects.toThrow(ConflictException);
  });

  it('blocks creation when the material name already exists', async () => {
    materialRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Acero',
      IsActive: true,
    });

    await expect(service.create({ Name: 'Acero' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('returns paginated search results with category-style meta', async () => {
    const data = [{ Id: 1, Name: 'Acero', IsActive: true }];
    const qb = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };

    materialRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.search({ page: 1, limit: 10, q: 'ace', state: true });

    expect(qb.orderBy).toHaveBeenCalledWith('material.Name', 'ASC');
    expect(qb.andWhere).toHaveBeenCalledWith('LOWER(material.Name) LIKE :term', {
      term: '%ace%',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('material.IsActive = :state', {
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
