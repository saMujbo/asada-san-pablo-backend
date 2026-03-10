import { ConflictException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { ProductService } from 'src/product/product.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let productService: {
    isOnCategory: jest.Mock;
  };

  beforeEach(async () => {
    categoryRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    productService = {
      isOnCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepo,
        },
        {
          provide: ProductService,
          useValue: productService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('blocks deactivation when the category has associated products', async () => {
    categoryRepo.findOne.mockResolvedValue({
      Id: 1,
      Name: 'Fontaneria',
      IsActive: true,
    });
    productService.isOnCategory.mockResolvedValue(true);

    await expect(service.update(1, { IsActive: false })).rejects.toThrow(
      BadRequestException,
    );

    expect(productService.isOnCategory).toHaveBeenCalledWith(1);
    expect(categoryRepo.save).not.toHaveBeenCalled();
  });

  it('soft deletes the category when it has no associated products', async () => {
    const category = {
      Id: 1,
      Name: 'Fontaneria',
      IsActive: true,
    };

    categoryRepo.findOne.mockResolvedValue(category);
    productService.isOnCategory.mockResolvedValue(false);
    categoryRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.remove(1);

    expect(result.IsActive).toBe(false);
    expect(categoryRepo.save).toHaveBeenCalledWith(category);
  });

  it('reactivates an inactive category', async () => {
    const category = {
      Id: 1,
      Name: 'Fontaneria',
      IsActive: false,
    };

    categoryRepo.findOne.mockResolvedValue(category);
    categoryRepo.save.mockImplementation(async (entity) => entity);

    const result = await service.reactivate(1);

    expect(result.IsActive).toBe(true);
    expect(categoryRepo.save).toHaveBeenCalledWith(category);
  });

  it('throws when trying to reactivate a missing category', async () => {
    categoryRepo.findOne.mockResolvedValue(null);

    await expect(service.reactivate(99)).rejects.toThrow(ConflictException);
  });
});
