import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { MaterialService } from 'src/material/material.service';
import { UnitMeasureService } from 'src/unit_measure/unit_measure.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPaginationDto } from './dto/productPaginationDto';
import { changeState } from 'src/utils/changeState';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly categoryService: CategoriesService,
    private readonly materialService: MaterialService,
    private readonly unitmeasure: UnitMeasureService
  ){}
  
  async create(createProductDto: CreateProductDto) {
    const [category, material, unit] = await Promise.all([
      this.categoryService.findOne(createProductDto.CategoryId),
      this.materialService.findOne(createProductDto.MaterialId),
      this.unitmeasure.findOne(createProductDto.UnitMeasureId),
    ]);

    const newProduct = this.productRepo.create({
      Name: createProductDto.Name,
      Type: createProductDto.Type,
      Observation: createProductDto.Observation,
      Category: category,
      Material: material,
      UnitMeasure: unit,
    });
    return await this.productRepo.save(newProduct);
  }

  async findAll() {
    return this.productRepo.find({ relations: ['Category', 'Material', 'UnitMeasure'] });
  }

  // products.service.ts
  async search({
    page = 1,
    limit = 10,
    name,
    categoryId,
    materialId,
    unitId,
  }: ProductPaginationDto) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.Category', 'category')
      .leftJoinAndSelect('product.Material', 'material')
      .leftJoinAndSelect('product.UnitMeasure', 'unit')
      .skip(skip)
      .take(take);

    // Filtro por texto: Name / Type / Observation (case-insensitive)
    if (name?.trim()) {
      const n = name.trim().toLowerCase();
      qb.andWhere(
        `(LOWER(product.Name) LIKE :n
          OR LOWER(product.Type) LIKE :n
          OR LOWER(product.Observation) LIKE :n)`,
        { n: `%${n}%` }
      );
      // En Postgres podrías usar ILIKE:
      // qb.andWhere(`product.Name ILIKE :n OR product.Type ILIKE :n OR product.Observation ILIKE :n`, { n: `%${name.trim()}%` });
    }

    // Filtros por FK (usa los aliases unidos para mayor portabilidad)
    if (typeof categoryId === 'number') {
      qb.andWhere('category.Id = :categoryId', { categoryId });
      // Alternativa si prefieres filtrar por la FK directa:
      // qb.andWhere('product.CategoryId = :categoryId', { categoryId });
    }
    if (typeof materialId === 'number') {
      qb.andWhere('material.Id = :materialId', { materialId });
      // Alternativa: qb.andWhere('product.MaterialId = :materialId', { materialId });
    }
    if (typeof unitId === 'number') {
      qb.andWhere('unit.Id = :unitId', { unitId });
      // Alternativa: qb.andWhere('product.UnitMeasureId = :unitId', { unitId });
    }

    qb.orderBy('product.Name', 'ASC');
    // qb.distinct(true); // actívalo si en el futuro agregas joins 1:N que dupliquen filas

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
    const foundProduct = await this.productRepo.findOne({
      where: { Id, IsActive: true },
      relations: ['Category', 'Material', 'UnitMeasure'],
    });

    if(!foundProduct) throw new ConflictException(`Product with Id ${Id} not found`);
    return foundProduct;
  }
  

  async update(Id: number, updateProductDto: UpdateProductDto) {
    const updateProduct = await this.findOne(Id);

    if (updateProductDto.Name !== undefined) updateProduct.Name = updateProductDto.Name;
    if (updateProductDto.Type !== undefined) updateProduct.Type = updateProductDto.Type;
    if (updateProductDto.Observation !== undefined) updateProduct.Observation = updateProductDto.Observation;
    if (updateProductDto.IsActive !== undefined && updateProductDto.IsActive != null) 
          updateProduct.IsActive = updateProductDto.IsActive;
    // relaciones (si vienen)
    if (updateProductDto.CategoryId !== undefined)
      updateProduct.Category = await this.categoryService.findOne(updateProductDto.CategoryId);
    if (updateProductDto.MaterialId !== undefined)
      updateProduct.Material = await this.categoryService.findOne(updateProductDto.MaterialId);
    if (updateProductDto.UnitMeasureId !== undefined)
      updateProduct.UnitMeasure = await this.categoryService.findOne(updateProductDto.UnitMeasureId);
    
    
    return await this.productRepo.save(updateProduct);
  }

  async remove(Id: number) {
    const removeproduct = await this.findOne(Id);

    removeproduct.IsActive= false;
    return await this.productRepo.save(removeproduct);
  }

  async reactivate(Id: number) {
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);

    return await this.productRepo.save(updateActive);
  }
}
