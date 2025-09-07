import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

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

    return await this.categoryRepo.save(foundCategory);
  }

  async remove(Id: number) {
    const categoryToRemove = await this.findOne(Id);

    categoryToRemove.IsActive = false;

    return await this.categoryRepo.save(categoryToRemove);
  }
}
