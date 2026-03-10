import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository, DataSource } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { MaterialService } from 'src/material/material.service';
import { UnitMeasureService } from 'src/unit_measure/unit_measure.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPaginationDto } from './dto/productPaginationDto';
import { changeState } from 'src/utils/changeState';
import { LegalSupplierService } from 'src/supplier/legal-supplier/legal-supplier.service';
import { PhysicalSupplierService } from 'src/supplier/physical-supplier/physical-supplier.service';
import { ProductSupplier } from './entities/product-supplier.entity';
import { SupplierService } from 'src/supplier/supplier.service';
import { buildPaginationMeta } from 'src/common/pagination/pagination.util';
import { PaginatedResponse } from 'src/common/pagination/types/paginated-response';

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
    @InjectRepository(ProductSupplier)
    private readonly productSupplierRepo: Repository<ProductSupplier>,
    @Inject(forwardRef(() => SupplierService))
    private readonly supplierService: SupplierService,
    @Inject(forwardRef(() => LegalSupplierService))
    private readonly legalSupplierService: LegalSupplierService,
    @Inject(forwardRef(() => PhysicalSupplierService))
    private readonly physicalSupplierService: PhysicalSupplierService,
    private readonly dataSource: DataSource,
  ){}
  
  async create(createProductDto: CreateProductDto) {
    const {
      CategoryId, 
      MaterialId, 
      UnitMeasureId,
      SuppliersIds,
      ...productData
    } = createProductDto;

    // Validación de proveedores requeridos
    if (!SuppliersIds || SuppliersIds.length === 0) {
      throw new BadRequestException('Faltan proveedores para agregar un producto!');
    }

    return this.dataSource.transaction(async (manager) => {
      // Validar que existan las entidades relacionadas
      const [category, material, unitMeasure] = await Promise.all([
        this.categoryService.findOne(CategoryId),
        this.materialService.findOne(MaterialId),
        this.unitmeasureService.findOne(UnitMeasureId),
      ]);

      // Validar que existan los proveedores
      const suppliers = await this.supplierService.findAllByIds(SuppliersIds);

      // Crear el producto
      const product = manager.create(Product, {
        ...productData,
        Category: category,
        Material: material,
        UnitMeasure: unitMeasure,
      });

      await manager.save(product);

      // Crear las relaciones Product-Supplier
      const productSuppliers = suppliers.map(supplier =>
        manager.create(ProductSupplier, {
          Product: product,
          Supplier: supplier,
        })
      );

      await manager.save(productSuppliers);

      // Retornar el producto con sus relaciones
      return await manager.findOne(Product, {
        where: { Id: product.Id },
        relations: [
          'Category', 
          'Material', 
          'UnitMeasure', 
          'ProductSuppliers', 
          'ProductSuppliers.Supplier'
        ],
      });
    });
  }

  async findAll() {
    return this.productRepo.find({ 
      relations: [
        'Category', 
        'Material', 
        'UnitMeasure', 
        'ProductSuppliers',
        'ProductSuppliers.Supplier'
      ], 
      where: { IsActive: true } 
    });
  }

  // products.service.ts
  async search(dto: ProductPaginationDto): Promise<PaginatedResponse<Product>> {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(dto.limit) || 10));
    const skip = (page - 1) * limit;
    const {
      q,
      name,
      categoryId,
      materialId,
      unitId,
      supplierId,
      state,
      sortBy = 'name',
      sortDir = 'ASC',
    } = dto;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.Category', 'category')
      .leftJoinAndSelect('product.Material', 'material')
      .leftJoinAndSelect('product.UnitMeasure', 'unit')
      .leftJoinAndSelect('product.ProductSuppliers', 'product_suppliers')
      .leftJoinAndSelect('product_suppliers.Supplier', 'supplier')
      .distinct(true)
      .skip(skip)
      .take(limit);

    const searchTerm = q?.trim() || name?.trim();
    if (searchTerm) {
      const term = `%${searchTerm.toLowerCase().replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      qb.andWhere(
        `(LOWER(product.Name) LIKE :term
          OR LOWER(product.Type) LIKE :term
          OR LOWER(product.Observation) LIKE :term)`,
        { term }
      );
    }

    if (typeof categoryId === 'number') {
      qb.andWhere('category.Id = :categoryId', { categoryId });
    }
    if (typeof materialId === 'number') {
      qb.andWhere('material.Id = :materialId', { materialId });
    }
    if (typeof unitId === 'number') {
      qb.andWhere('unit.Id = :unitId', { unitId });
    }
    if (typeof supplierId === 'number') {
      qb.andWhere('supplier.Id = :supplierId', { supplierId });
    }
    if (state !== undefined) {
      qb.andWhere('product.IsActive = :state', { state });
    }

    const supplierSortSubquery = qb.subQuery()
      .select('MIN(sortSupplier.Name)')
      .from(ProductSupplier, 'sortProductSupplier')
      .leftJoin('sortProductSupplier.Supplier', 'sortSupplier')
      .where('sortProductSupplier.ProductId = product.Id')
      .getQuery();

    switch (sortBy) {
      case 'category':
        qb.orderBy('category.Name', sortDir).addOrderBy('product.Name', 'ASC');
        break;
      case 'supplier':
        qb.orderBy(supplierSortSubquery, sortDir).addOrderBy('product.Name', 'ASC');
        break;
      case 'type':
        qb.orderBy('product.Type', sortDir).addOrderBy('product.Name', 'ASC');
        break;
      case 'name':
      default:
        qb.orderBy('product.Name', sortDir);
        break;
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

  async findOne(Id: number) {
    const foundProduct = await this.productRepo.findOne({
      where: { Id },
      relations: [
        'Category', 
        'Material', 
        'UnitMeasure', 
        'ProductSuppliers',
        'ProductSuppliers.Supplier'
      ],
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
    return this.dataSource.transaction(async (manager) => {
      // Buscar el producto existente
      const updateProduct = await manager.findOne(Product, { where: { Id } });
      if (!updateProduct) throw new NotFoundException(`Product with Id ${Id} not found`);

      // Actualizar campos básicos
      if (updateProductDto.Name !== undefined) updateProduct.Name = updateProductDto.Name;
      if (updateProductDto.Type !== undefined) updateProduct.Type = updateProductDto.Type;
      if (updateProductDto.Observation !== undefined) updateProduct.Observation = updateProductDto.Observation;
      if (updateProductDto.IsActive !== undefined && updateProductDto.IsActive != null) 
        updateProduct.IsActive = updateProductDto.IsActive;

      // Actualizar relaciones simples
      if (updateProductDto.CategoryId !== undefined)
        updateProduct.Category = await this.categoryService.findOne(updateProductDto.CategoryId);
      if (updateProductDto.MaterialId !== undefined)
        updateProduct.Material = await this.materialService.findOne(updateProductDto.MaterialId);
      if (updateProductDto.UnitMeasureId !== undefined)
        updateProduct.UnitMeasure = await this.unitmeasureService.findOne(updateProductDto.UnitMeasureId);

      // Guardar cambios básicos del producto
      await manager.save(updateProduct);

      // Actualizar relación muchos a muchos con Suppliers si se proporciona
      if (updateProductDto.SuppliersIds !== undefined) {
        // Validar que existan los proveedores
        const suppliers = await this.supplierService.findAllByIds(updateProductDto.SuppliersIds);

        // Eliminar relaciones existentes
        await manager.delete(ProductSupplier, { Product: { Id: updateProduct.Id } });

        // Crear nuevas relaciones si hay proveedores
        if (updateProductDto.SuppliersIds.length > 0) {
          const newProductSuppliers = suppliers.map(supplier =>
            manager.create(ProductSupplier, {
              Product: updateProduct,
              Supplier: supplier,
            })
          );
          await manager.save(newProductSuppliers);
        }
      }

      // Retornar el producto actualizado con sus relaciones
      // return await manager.findOne(Product, {
      //   where: { Id: updateProduct.Id },
      //   relations: [
      //     'Category', 
      //     'Material', 
      //     'UnitMeasure', 
      //     'ProductSuppliers', 
      //     'ProductSuppliers.Supplier'
      //   ],
      // });

      return await updateProduct;
    });
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

  // Métodos comentados - ya no se usan las relaciones directas con LegalSupplier y PhysicalSupplier
  // async isOnLegalSupplier(Id: number) {
  //   const hasActiveProducts = await this.productRepo.exist({
  //     where: { LegalSupplier: { Id } },
  //   });
  //   return hasActiveProducts;
  // }

  // async isOnPhysicalSupplier(Id: number) {
  //   const hasActiveProducts = await this.productRepo.exist({
  //     where: { PhysicalSupplier: { Id } },
  //   });
  //   return hasActiveProducts;
  // }
  
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

  // Nuevo método para verificar si un Supplier está siendo usado
  async isOnSupplier(Id: number) {
    const hasActiveProducts = await this.productSupplierRepo.exist({
      where: { Supplier: { Id } },
    });
    return hasActiveProducts;
  }

}
