import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoriesPaginationDto } from './dto/categoriesPaginationDto';
import { changeState } from 'src/utils/changeState';

@Injectable()
export class CategoriesService {
  constructor (
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ){}

  async create(createObjectCategory: CreateCategoryDto) {
    const newCategory = this.categoryRepo.create(createObjectCategory);
    return await this.categoryRepo.save(newCategory);
  }

  async findAll() {
    return await this.categoryRepo.find();
  }

  async search({ page = 1, limit = 10, name }: CategoriesPaginationDto) {
    // sanea y limita page/limit
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .skip(skip)
      .take(take);

    // filtro por nombre (case-insensitive con LOWER + LIKE)
    if (name?.trim()) {
      qb.andWhere('LOWER(category.Name) LIKE :name', {
        name: `%${name.trim().toLowerCase()}%`,
      });
    }

    // orden por nombre
    qb.orderBy('category.Name', 'ASC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: take,
        pageCount: Math.max(1, Math.ceil(total / take)),
        hasNextPage: pageNum * take < total,
        hasPrevPage: pageNum > 1,
      },
    };
  }


  async findOne(Id: number) {
    const categoryFound = await this.categoryRepo.findOne({ 
      where: { Id, IsActive: true },
    });
    
    if (!categoryFound) throw new ConflictException(`User with Id ${Id} not found`);
    
    return categoryFound;
  }

  async update(Id: number, updateObjectCategory: UpdateCategoryDto) {
    const foundCategory = await this.categoryRepo.findOne({ where: { Id } });

    if (!foundCategory) {
      throw new ConflictException(`User with Id ${Id} not found`);
    }

    if (updateObjectCategory.Name !== undefined && updateObjectCategory.Name != null && 
      updateObjectCategory.Name !== '') foundCategory.Name = updateObjectCategory.Name;
    if (updateObjectCategory.Description !== undefined && updateObjectCategory.Description != null && 
      updateObjectCategory.Description !== '') foundCategory.Description = updateObjectCategory.Description;
    if (updateObjectCategory.IsActive !== undefined && updateObjectCategory.IsActive != null) 
      foundCategory.IsActive = updateObjectCategory.IsActive;

    return await this.categoryRepo.save(foundCategory);
  }

  async remove(Id: number) {
    const categoryToRemove = await this.findOne(Id);

    categoryToRemove.IsActive = false;

    return await this.categoryRepo.save(categoryToRemove);
  }

  async reactivate(Id: number) {
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);
  
    return await this.categoryRepo.save(updateActive);
  }
}
