import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LegalSupplier } from './entities/legal-supplier.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { LegalSupplierPaginationDto } from './dto/pagination-legal-supplier.dto';
import { Supplier, ProviderType } from 'src/supplier/entities/supplier.entity';

@Injectable()
export class LegalSupplierService {
  constructor(
      @InjectRepository(LegalSupplier)
      private readonly legalSupplierRepo: Repository<LegalSupplier>,
      @InjectRepository(Supplier)
      private readonly supplierRepo: Repository<Supplier>,
      @Inject(forwardRef(() => ProductService))
      private readonly productSv: ProductService,
      private readonly dataSource: DataSource,
    ){}

  async create(createLegalSupplierDto: CreateLegalSupplierDto) {
    const { LegalID, CompanyName, Email, PhoneNumber, Location, WebSite } = createLegalSupplierDto;

    return this.dataSource.transaction(async (manager) => {
      // Crear la entidad Supplier base
      const supplier = manager.create(Supplier, {
        IDcard: LegalID,
        Name: CompanyName,
        Email,
        PhoneNumber,
        Location,
        IsActive: true,
        Type: ProviderType.LEGAL
      });

      await manager.save(supplier);

      // Crear la entidad LegalSupplier específica
      const legalSupplier = manager.create(LegalSupplier, {
        Supplier: supplier,
        WebSite
      });

      await manager.save(legalSupplier);

      // Retornar el LegalSupplier con la relación Supplier cargada
      return await manager.findOne(LegalSupplier, {
        where: { Id: legalSupplier.Id },
        relations: ['Supplier']
      });
    });
  }

  async findAll() {
    return await this.legalSupplierRepo.find( {
      where: {Supplier: {IsActive: true}},
      relations: ['Products', 'AgentSupppliers', 'Supplier']
    });
  }

  async search({page =1, limit = 10,name,state}:LegalSupplierPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take; 

    const qb = this.legalSupplierRepo.createQueryBuilder('legal_supplier')
    .leftJoinAndSelect('legal_supplier.Supplier', 'supplier')
    .skip(skip)
    .take(take);

      if (name?.trim()) {
        qb.andWhere('LOWER(supplier.Name) LIKE :name', {
          name: `%${name.trim().toLowerCase()}%`,
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
    const legalsupplier = await this.legalSupplierRepo.findOne({
      where: {Id, Supplier: {IsActive: true}},
      relations: ['Products', 'AgentSupppliers', 'Supplier']
    });

    if(!legalsupplier) throw new NotFoundException(`Legal Supplier with Id ${Id} not found`);
    return legalsupplier;
  }

  async update(Id: number, updateLegalSupplierDto: UpdateLegalSupplierDto) {
    const foundSupplier = await this.legalSupplierRepo.findOne({ 
      where: { Id },
      relations: ['Supplier']
    });

    if (!foundSupplier) {
      throw new NotFoundException(`Supplier with Id ${Id} not found`);
    }
  
    const hasProducts = await this.productSv.isOnSupplier(foundSupplier.Supplier.Id);
      if (hasProducts && updateLegalSupplierDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
  
    if (updateLegalSupplierDto.CompanyName !== undefined && updateLegalSupplierDto.CompanyName != null 
      && updateLegalSupplierDto.CompanyName!=='') 
        foundSupplier.Supplier.Name = updateLegalSupplierDto.CompanyName;
    if (updateLegalSupplierDto.Email !== undefined && updateLegalSupplierDto.Email != null 
      && updateLegalSupplierDto.Email!=='') 
        foundSupplier.Supplier.Email = updateLegalSupplierDto.Email;
    if (updateLegalSupplierDto.PhoneNumber !== undefined && updateLegalSupplierDto.PhoneNumber != null 
      && updateLegalSupplierDto.PhoneNumber!=='') 
        foundSupplier.Supplier.PhoneNumber = updateLegalSupplierDto.PhoneNumber;
    if (updateLegalSupplierDto.Location !== undefined && updateLegalSupplierDto.Location != null 
      && updateLegalSupplierDto.Location!=='') 
        foundSupplier.Supplier.Location = updateLegalSupplierDto.Location;  
    if (updateLegalSupplierDto.WebSite !== undefined && updateLegalSupplierDto.WebSite != null 
      &&updateLegalSupplierDto.WebSite!=='') 
        foundSupplier.WebSite = updateLegalSupplierDto.WebSite;  
    if (updateLegalSupplierDto.IsActive !== undefined && updateLegalSupplierDto.IsActive != null) 
        foundSupplier.Supplier.IsActive = updateLegalSupplierDto.IsActive;

    return await this.legalSupplierRepo.save(foundSupplier);
  }

  async remove(Id: number) {
    const supplierFound = await this.legalSupplierRepo.findOne({
      where: { Id },
      relations: ['Supplier']
    });

    if (!supplierFound) {
      throw new NotFoundException(`Legal Supplier with Id ${Id} not found`);
    }

    const hasProducts = await this.productSv.isOnSupplier(supplierFound.Supplier.Id);
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    supplierFound.Supplier.IsActive = false;
    return await this.legalSupplierRepo.save(supplierFound);
  }
}
