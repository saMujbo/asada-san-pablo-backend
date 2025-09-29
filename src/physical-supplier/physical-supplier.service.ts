import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhysicalSupplierDto } from './dto/create-physical-supplier.dto';
import { UpdatePhysicalSupplierDto } from './dto/update-physical-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PhysicalSupplier } from './entities/physical-supplier.entity';
import { Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { PhysicalSupplierPaginationDto } from './dto/pagination-physical-supplier.dto';

@Injectable()
export class PhysicalSupplierService {
  constructor(
    @InjectRepository(PhysicalSupplier)
    private readonly physicalSupplierRepo: Repository<PhysicalSupplier>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService,
  ){}

  async create(createPhysicalSupplierDto: CreatePhysicalSupplierDto) {
    const physicalSupplier = this.physicalSupplierRepo.create(createPhysicalSupplierDto);
    return await this.physicalSupplierRepo.save(physicalSupplier);
  }

  async findAll() {
    return await this.physicalSupplierRepo.find( {
      where: {IsActive: true},
      relations: ['Products']
    });
  }

  async search({ page = 1, limit = 10, name, state}: PhysicalSupplierPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take; 

    const qb = this.physicalSupplierRepo.createQueryBuilder('physical_supplier')
    .skip(skip)
    .take(take);

        if (name?.trim()) {
        qb.andWhere('LOWER(physical_supplier.Name) LIKE :name', {
          name: `%${name.trim().toLowerCase()}%`,
        });
      }

      // se aplica solo si viene definido (true o false)
      if (state) {
        qb.andWhere('physical_supplier.IsActive = :state', { state });
      }

          qb.orderBy('physical_supplier.Name', 'ASC');

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
      where: {Id, IsActive: true},
      relations: ['Products']
    });
  
    if(!physicalSupplier) throw new NotFoundException(`Product with Id ${Id} not found`);
    return physicalSupplier;
  }

  async update(Id: number, updatePhysicalSupplierDto: UpdatePhysicalSupplierDto) {
    const foundSupplier = await this.physicalSupplierRepo.findOne({ where: { Id } });
    
    if (!foundSupplier) {
      throw new NotFoundException(`Supplier with Id ${Id} not found`);
    }
    
    const hasProducts = await this.productSv.isOnLegalSupplier(Id);
      if (hasProducts && updatePhysicalSupplierDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    
    if (updatePhysicalSupplierDto.Name !== undefined && updatePhysicalSupplierDto.Name != null 
      && updatePhysicalSupplierDto.Name!=='') 
        foundSupplier.Name = updatePhysicalSupplierDto.Name;
    if (updatePhysicalSupplierDto.Email !== undefined && updatePhysicalSupplierDto.Email != null 
      && updatePhysicalSupplierDto.Email!=='') 
        foundSupplier.Email = updatePhysicalSupplierDto.Email;
    if (updatePhysicalSupplierDto.PhoneNumber !== undefined && updatePhysicalSupplierDto.PhoneNumber != null 
      && updatePhysicalSupplierDto.PhoneNumber!=='') 
        foundSupplier.PhoneNumber = updatePhysicalSupplierDto.PhoneNumber;
    if (updatePhysicalSupplierDto.Location !== undefined && updatePhysicalSupplierDto.Location != null 
      && updatePhysicalSupplierDto.Location!=='') 
        foundSupplier.Location = updatePhysicalSupplierDto.Location;
    if (updatePhysicalSupplierDto.IsActive !== undefined && updatePhysicalSupplierDto.IsActive != null) 
        foundSupplier.IsActive = updatePhysicalSupplierDto.IsActive;
  
    return await this.physicalSupplierRepo.save(foundSupplier);
  }

  async remove(Id: number) {
    const supplierFound = await this.findOne(Id)

    const hasProducts = await this.productSv.isOnPhysicalSupplier(Id);
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    supplierFound.IsActive = false;
    return await this.physicalSupplierRepo.save(supplierFound);
  }
}
