import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { In, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { changeState } from 'src/utils/changeState';
import { ProductService } from 'src/product/product.service';
import { SupplierPaginationDto } from './dto/SupplierPagination.dto';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo:Repository<Supplier>,
    @Inject(forwardRef(() => ProductService))
    private readonly productSv: ProductService
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const newSupplier = this.supplierRepo.create(createSupplierDto);
    return await this.supplierRepo.save(newSupplier);
  }

  async findAll() {
    return await this.supplierRepo.find({where:{IsActive:true}});
  }

  async search({ page = 1, limit = 10, Name, state }: SupplierPaginationDto) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * take;

    const qb = this.supplierRepo.createQueryBuilder('supplier')
      .skip(skip)
      .take(take);

    if (Name?.trim()) {
      qb.andWhere('LOWER(supplier.Name) LIKE :name', {
        name: `%${Name.trim().toLowerCase()}%`,
      });
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
    const supplierFound = await this.supplierRepo.findOne({
      where: {Id, IsActive:true}
    });
    if(!supplierFound)throw new ConflictException(`Supplier with Id ${Id} not found`);
    return supplierFound;
  }

  async update(Id: number, updateSupplierDto: UpdateSupplierDto) {
        const foundSupplier = await this.supplierRepo.findOne({ where: { Id } });
        
    if (!foundSupplier) {
      throw new ConflictException(`Supplier with Id ${Id} not found`);
    }

    const hasProducts = await this.productSv.isOnSupplier(Id);
        if (hasProducts && updateSupplierDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }

    if (updateSupplierDto.Name !== undefined && updateSupplierDto.Name != null &&updateSupplierDto.Name!=='') foundSupplier.Name = updateSupplierDto.Name;
    if (updateSupplierDto.Email !== undefined && updateSupplierDto.Email != null &&updateSupplierDto.Email!=='') foundSupplier.Email = updateSupplierDto.Email;
    if (updateSupplierDto.PhoneNumber !== undefined && updateSupplierDto.PhoneNumber != null &&updateSupplierDto.PhoneNumber!=='') foundSupplier.PhoneNumber = updateSupplierDto.PhoneNumber;
    if (updateSupplierDto.Location !== undefined && updateSupplierDto.Location != null &&updateSupplierDto.Location!=='') foundSupplier.Location = updateSupplierDto.Location;  
    if (updateSupplierDto.IsActive !== undefined && updateSupplierDto.IsActive != null) foundSupplier.IsActive = updateSupplierDto.IsActive;
    return await this.supplierRepo.save(foundSupplier);
  }

  async remove(Id: number) { 
    const supplierFound = await this.findOne(Id)

    const hasProducts = await this.productSv.isOnSupplier(Id);
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    supplierFound.IsActive = false;
    return await this.supplierRepo.save(supplierFound);
  }

  async reactivate(Id: number) {
    const updateActive = await this.findOne(Id);
    changeState(updateActive.IsActive);
  
    return await this.supplierRepo.save(updateActive);
  }
}
