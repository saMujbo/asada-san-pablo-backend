import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoriesPaginationDto } from './dto/categoriesPaginationDto';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';
import { applyDefinedFields } from 'src/utils/validation.utils';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';

@Injectable()
export class CategoriesService {
  constructor (
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject(forwardRef(() => ProductService))
        private readonly productSv: ProductService,
  ){}

  async create(createCategoryDto: CreateCategoryDto) {
    const categoryRepo = await this.categoryRepo.findOne({ where: { Name: createCategoryDto.Name } });

    if (categoryRepo) {
      throw new ConflictException(`Category with Name ${createCategoryDto.Name} already exists`);
    }

    const newCategory = this.categoryRepo.create(createCategoryDto);
    return await this.categoryRepo.save(newCategory);
  } 

  async search(dto: CategoriesPaginationDto): Promise<PaginatedResponse<Category>> {
    const page = Math.max(1, Number(dto.page) ?? 1);
    const limit = Math.min(100, Math.max(1, Number(dto.limit) ?? 10));
    const skip = (page - 1) * limit;
    const { q, state, sortDir = 'ASC' } = dto;

    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .skip(skip)
      .take(limit)
      .orderBy('category.Name', sortDir ?? 'ASC');

    if (q?.trim()) {
      const term = `%${q.trim().toLowerCase().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere(
        '(LOWER(category.Name) LIKE :term OR LOWER(category.Description) LIKE :term)',
        { term },
      );
    }

    if (state !== undefined) {
      qb.andWhere('category.IsActive = :state', { state });
    }

    const [data, totalItems] = await qb.getManyAndCount();

    return {
      data,
      meta: buildPaginationMeta({
        totalItems,
        page,
        limit,
        itemCount: data.length,
      }),
    };
  }

  async findAll() {
    return await this.categoryRepo.find({ order: { Name: 'ASC' }, where: { IsActive: true } });
  }

  async findOne(Id: number) {
    const categoryFound = await this.categoryRepo.findOne({ 
      where: { Id, IsActive: true },
    });
    
    if (!categoryFound) throw new ConflictException(`Category with Id ${Id} not found`);
    
    return categoryFound;
  }

  async update(Id: number, updateObjectCategory: UpdateCategoryDto) {
    const foundCategory = await this.categoryRepo.findOne({ where: { Id } });

    if (!foundCategory) {
      throw new ConflictException(`Category with Id ${Id} not found`);
    }

    const hasProducts = await this.productSv.isOnCategory(Id);
    
    if (hasProducts && updateObjectCategory.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar la categoría ${Id} porque está asociado a al menos un producto.`
      );
    }

    const { Name, Description, IsActive } = updateObjectCategory;

    applyDefinedFields(foundCategory, {
      Name, Description, IsActive
    });

    return await this.categoryRepo.save(foundCategory);
  }

  async remove(Id: number) {
    const categoryToRemove = await this.findOne(Id);

    const hasProducts = await this.productSv.isOnCategory(Id);
    
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar la categoría ${Id} porque está asociado a al menos un producto.`
      );
    }

    categoryToRemove.IsActive = false;
    return await this.categoryRepo.save(categoryToRemove);
  }

  async reactivate(Id: number) {
    const updateActive = await this.categoryRepo.findOne({ where: { Id } });

    if (!updateActive) {
      throw new ConflictException(`Category with Id ${Id} not found`);
    }

    updateActive.IsActive = changeState(updateActive.IsActive);
  
    return await this.categoryRepo.save(updateActive);
  }
}
