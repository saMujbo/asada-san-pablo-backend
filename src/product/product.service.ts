import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { MaterialService } from 'src/material/material.service';
import { UnitMeasureService } from 'src/unit_measure/unit_measure.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPaginationDto } from './dto/productPaginationDto';
import { changeState } from 'src/utils/changeState';
import { LegalSupplierService } from 'src/legal-supplier/legal-supplier.service';
import { PhysicalSupplierService } from 'src/physical-supplier/physical-supplier.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => MaterialService))
    private readonly materialService: MaterialService,
    @Inject(forwardRef(() => UnitMeasureService))
    private readonly unitmeasureService: UnitMeasureService,
    @Inject(forwardRef(() => LegalSupplierService))
    private readonly legalSupplierSv: LegalSupplierService,
    @Inject(forwardRef(() => PhysicalSupplierService))
    private readonly physicalSupplierSv: PhysicalSupplierService,
  ){}
  
  async create(createProductDto: CreateProductDto) {
    const {
      CategoryId, 
      MaterialId, 
      UnitMeasureId, 
      LegalSupplierId, 
      PhysicalSupplierId,
      ...rest
    } = createProductDto;

    if ((LegalSupplierId == null) && (PhysicalSupplierId == null)) {
      // En Nest es mejor BadRequestException
      throw new BadRequestException('Faltan argumentos para agregar un producto!');
    }

    const [category, material, unit] = await Promise.all([
      this.categoryService.findOne(CategoryId),
      this.materialService.findOne(MaterialId),
      this.unitmeasureService.findOne(UnitMeasureId),
    ]);

    if(LegalSupplierId != null){
      const legalSupplier = await this.legalSupplierSv.findOne(LegalSupplierId);

      const newProduct = await this.productRepo.create({
        Category: category,
        Material: material,
        UnitMeasure: unit,
        LegalSupplier: legalSupplier,
        ...rest
      });
      return await this.productRepo.save(newProduct);
    }
    else{
      const physicalSupplier = await this.physicalSupplierSv.findOne(PhysicalSupplierId);

      const newProduct = await this.productRepo.create({
        Category: category,
        Material: material,
        UnitMeasure: unit,
        PhysicalSupplier: physicalSupplier,
        ...rest
      });
      return await this.productRepo.save(newProduct);
    }
    
  }

  async findAll() {
    return this.productRepo.find({ relations: ['Category', 'Material', 'UnitMeasure', 'PhysicalSupplier', 'LegalSupplier'], where: { IsActive: true } });
  }

  // products.service.ts
  async search({
    page = 1,
    limit = 10,
    name,
    categoryId,
    materialId,
    unitId,
    supplierId,
    state
  }: ProductPaginationDto) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.Category', 'category')
      .leftJoinAndSelect('product.Material', 'material')
      .leftJoinAndSelect('product.UnitMeasure', 'unit')
      .leftJoinAndSelect('product.PhysicalSupplier', 'physical_supplier')
      .leftJoinAndSelect('product.LegalSupplier', 'legal_supplier')
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
    if (typeof supplierId === 'number') {
      qb.andWhere('supplier.Id = :supplierId', { supplierId });
      // Alternativa: qb.andWhere('product.UnitMeasureId = :unitId', { unitId });
    }
    if(state){
      qb.andWhere('product.IsActive = :state',{state})
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
      where: { Id },
      relations: ['Category', 'Material', 'UnitMeasure', 'PhysicalSupplier', 'LegalSupplier'],
    });

    if(!foundProduct) throw new ConflictException(`Product with Id ${Id} not found`);
    return foundProduct;
  }
  
  async findAllByIds(IDsArray:number[]){
    const products = await this.productRepo.find({
      where:{Id: In(IDsArray)},
    });
    if(products.length !== IDsArray.length){
      const encontrados = new Set(products.map(p=>p.Id));
      const faltantes = IDsArray.filter(id=> !encontrados.has(id));
      throw new NotFoundException(`Productos inexistentes:[${faltantes.join(',')}]`);
    }
    return products;
  }
  
  async update(Id: number, updateProductDto: UpdateProductDto) {
    const updateProduct = await this.productRepo.findOne({ where: {Id} });
    if(!updateProduct) throw new NotFoundException(`Product with Id ${Id} not found`);

    if (updateProductDto.Name !== undefined) updateProduct.Name = updateProductDto.Name;
    if (updateProductDto.Type !== undefined) updateProduct.Type = updateProductDto.Type;
    if (updateProductDto.Observation !== undefined) updateProduct.Observation = updateProductDto.Observation;
    if (updateProductDto.IsActive !== undefined && updateProductDto.IsActive != null) 
        updateProduct.IsActive = updateProductDto.IsActive;
    // relaciones (si vienen)
    if (updateProductDto.CategoryId !== undefined)
      updateProduct.Category = await this.categoryService.findOne(updateProductDto.CategoryId);
    if (updateProductDto.MaterialId !== undefined)
      updateProduct.Material = await this.materialService.findOne(updateProductDto.MaterialId);
    if (updateProductDto.UnitMeasureId !== undefined)
      updateProduct.UnitMeasure = await this.unitmeasureService.findOne(updateProductDto.UnitMeasureId);

    if (updateProductDto.LegalSupplierId !== undefined)
      updateProduct.LegalSupplier = await this.legalSupplierSv.findOne(updateProductDto.LegalSupplierId);
    if (updateProductDto.PhysicalSupplierId !== undefined)
      updateProduct.PhysicalSupplier = await this.physicalSupplierSv.findOne(updateProductDto.PhysicalSupplierId);
    
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

  async isOnCategory(Id: number) {
    const hasActiveProducts = await this.productRepo.exist({
      where: { Category: { Id } },
    });
    return hasActiveProducts;
  }

  async isOnLegalSupplier(Id: number) {
    const hasActiveProducts = await this.productRepo.exist({
      where: { LegalSupplier: { Id } },
    });
    return hasActiveProducts;
  }

  async isOnPhysicalSupplier(Id: number) {
    const hasActiveProducts = await this.productRepo.exist({
      where: { PhysicalSupplier: { Id } },
    });
    return hasActiveProducts;
  }
  
  async isOnMaterial(Id: number) {
    const hasActiveProducts = await this.productRepo.exist({
      where: { Material: { Id } },
    });
    return hasActiveProducts;
  }

  async isOnUnit(Id: number) {
    const hasActiveProducts = await this.productRepo.exist({
      where: { UnitMeasure: { Id } },
    });
    return hasActiveProducts;
  }

}
