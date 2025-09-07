import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { MaterialService } from 'src/material/material.service';
import { UnitMeasureService } from 'src/unit_measure/unit_measure.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
}
