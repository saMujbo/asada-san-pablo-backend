import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhysicalSupplierDto } from './dto/create-physical-supplier.dto';
import { UpdatePhysicalSupplierDto } from './dto/update-physical-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PhysicalSupplier } from './entities/physical-supplier.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { PhysicalSupplierPaginationDto } from './dto/pagination-physical-supplier.dto';
import { Supplier, ProviderType } from 'src/supplier/entities/supplier.entity';

@Injectable()
export class PhysicalSupplierService {
  constructor(
    @InjectRepository(PhysicalSupplier)
    private readonly physicalSupplierRepo: Repository<PhysicalSupplier>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService,
    private readonly dataSource: DataSource,
  ){}

  async create(createPhysicalSupplierDto: CreatePhysicalSupplierDto) {
    const { IDcard, Name, Surname1, Surname2, Email, PhoneNumber, Location } = createPhysicalSupplierDto;

    return this.dataSource.transaction(async (manager) => {
      // Crear la entidad Supplier base
      const supplier = manager.create(Supplier, {
        IDcard,
        Name,
        Email,
        PhoneNumber,
        Location,
        IsActive: true,
        Type: ProviderType.PHYSICAL
      });

      await manager.save(supplier);

      // Crear la entidad PhysicalSupplier específica
      const physicalSupplier = manager.create(PhysicalSupplier, {
        Supplier: supplier,
        Surname1,
        Surname2
      });

      await manager.save(physicalSupplier);

      // Retornar el PhysicalSupplier con la relación Supplier cargada
      return await manager.findOne(PhysicalSupplier, {
        where: { Id: physicalSupplier.Id },
        relations: ['Supplier']
      });
    });
  }

  async findAll() {
    return await this.physicalSupplierRepo.find( {
      where: {Supplier: {IsActive: true}},
      relations: ['Products', 'Supplier']
    });
  }

  async search({ page = 1, limit = 10, name, state}: PhysicalSupplierPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take; 

    const qb = this.physicalSupplierRepo.createQueryBuilder('physical_supplier')
    .leftJoinAndSelect('physical_supplier.Supplier', 'supplier')
    .skip(skip)
    .take(take);

      if (name?.trim()) {
        qb.andWhere(
        `(LOWER(supplier.Name) LIKE :name 
          OR LOWER(physical_supplier.Surname1) LIKE :name 
          OR LOWER(physical_supplier.Surname2) LIKE :name 
          OR LOWER(supplier.Email) LIKE :name)`,
        { name: `%${name.toLowerCase()}%` }
      );
      }

      // se aplica solo si viene definido (true o false)
      if (state) {
        qb.andWhere('supplier.IsActive = :state', { state });
      }

      qb.orderBy('supplier.Name', 'ASC');

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
    const physicalSupplier = await this.physicalSupplierRepo.findOne({
      where: {Id, Supplier: {IsActive: true}},
      relations: ['Products', 'Supplier']
    });
  
    if(!physicalSupplier) throw new NotFoundException(`Physical Supplier with Id ${Id} not found`);
    return physicalSupplier;
  }

  async update(Id: number, updatePhysicalSupplierDto: UpdatePhysicalSupplierDto) {
    const foundSupplier = await this.physicalSupplierRepo.findOne({ 
      where: { Id },
      relations: ['Supplier'] 
    });
    
    if (!foundSupplier) {
      throw new NotFoundException(`Supplier with Id ${Id} not found`);
    }
    
    const hasProducts = await this.productSv.isOnSupplier(foundSupplier.Supplier.Id);
      if (hasProducts && updatePhysicalSupplierDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    
    if (updatePhysicalSupplierDto.Name !== undefined && updatePhysicalSupplierDto.Name != null 
      && updatePhysicalSupplierDto.Name!=='') 
        foundSupplier.Supplier.Name = updatePhysicalSupplierDto.Name;
    if (updatePhysicalSupplierDto.Surname1 !== undefined && updatePhysicalSupplierDto.Surname1 != null 
      && updatePhysicalSupplierDto.Surname1!=='') 
        foundSupplier.Surname1 = updatePhysicalSupplierDto.Surname1;
    if (updatePhysicalSupplierDto.Surname2 !== undefined && updatePhysicalSupplierDto.Surname2 != null 
      && updatePhysicalSupplierDto.Surname2!=='') 
        foundSupplier.Surname2 = updatePhysicalSupplierDto.Surname2;
    if (updatePhysicalSupplierDto.Email !== undefined && updatePhysicalSupplierDto.Email != null 
      && updatePhysicalSupplierDto.Email!=='') 
        foundSupplier.Supplier.Email = updatePhysicalSupplierDto.Email;
    if (updatePhysicalSupplierDto.PhoneNumber !== undefined && updatePhysicalSupplierDto.PhoneNumber != null 
      && updatePhysicalSupplierDto.PhoneNumber!=='') 
        foundSupplier.Supplier.PhoneNumber = updatePhysicalSupplierDto.PhoneNumber;
    if (updatePhysicalSupplierDto.Location !== undefined && updatePhysicalSupplierDto.Location != null 
      && updatePhysicalSupplierDto.Location!=='') 
        foundSupplier.Supplier.Location = updatePhysicalSupplierDto.Location;
    if (updatePhysicalSupplierDto.IsActive !== undefined && updatePhysicalSupplierDto.IsActive != null) 
        foundSupplier.Supplier.IsActive = updatePhysicalSupplierDto.IsActive;
  
    return await this.physicalSupplierRepo.save(foundSupplier);
  }

  async remove(Id: number) {
    const supplierFound = await this.physicalSupplierRepo.findOne({
      where: { Id },
      relations: ['Supplier']
    });

    if (!supplierFound) {
      throw new NotFoundException(`Physical Supplier with Id ${Id} not found`);
    }

    const hasProducts = await this.productSv.isOnSupplier(supplierFound.Supplier.Id);
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    supplierFound.Supplier.IsActive = false;
    return await this.physicalSupplierRepo.save(supplierFound);
  }
}
