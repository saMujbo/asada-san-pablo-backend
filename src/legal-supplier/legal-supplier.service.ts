import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LegalSupplier } from './entities/legal-supplier.entity';
import { Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { LegalSupplierPaginationDto } from './dto/pagination-legal-supplier.dto';

@Injectable()
export class LegalSupplierService {
  constructor(
      @InjectRepository(LegalSupplier)
      private readonly legalSupplierRepo: Repository<LegalSupplier>,
      @Inject(forwardRef(() => ProductService))
      private readonly productSv: ProductService,
    ){}

  async create(createLegalSupplierDto: CreateLegalSupplierDto) {
    const legalsupplier = this.legalSupplierRepo.create(createLegalSupplierDto);
    return await this.legalSupplierRepo.save(legalsupplier);
  }

  async findAll() {
    return await this.legalSupplierRepo.find( {
      where: {IsActive: true},
      relations: ['Products', 'AgentSupppliers']
    });
  }

  async search({page =1, limit = 10,name,state}:LegalSupplierPaginationDto){
    const pageNum = Math.max(1, Number(page)||1);
    const take = Math.min(100, Math.max(1,Number(limit)||10));
    const skip = (pageNum -1)* take; 

    const qb = this.legalSupplierRepo.createQueryBuilder('legal_supplier')
    .skip(skip)
    .take(take);

        if (name?.trim()) {
        qb.andWhere('LOWER(legal_supplier.CompanyName) LIKE :name', {
          name: `%${name.trim().toLowerCase()}%`,
        });
      }

      // se aplica solo si viene definido (true o false)
      if (state) {
        qb.andWhere('legal_supplier.IsActive = :state', { state });
      }

          qb.orderBy('legal_supplier.CompanyName', 'ASC');

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
      where: {Id, IsActive: true},
      relations: ['Products', 'AgentSupppliers']
    });

    if(!legalsupplier) throw new NotFoundException(`Product with Id ${Id} not found`);
    return legalsupplier;
  }

  async update(Id: number, updateLegalSupplierDto: UpdateLegalSupplierDto) {
    const foundSupplier = await this.legalSupplierRepo.findOne({ where: { Id } });

    if (!foundSupplier) {
      throw new NotFoundException(`Supplier with Id ${Id} not found`);
    }
  
    const hasProducts = await this.productSv.isOnLegalSupplier(Id);
      if (hasProducts && updateLegalSupplierDto.IsActive === false) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
  
    if (updateLegalSupplierDto.CompanyName !== undefined && updateLegalSupplierDto.CompanyName != null 
      && updateLegalSupplierDto.CompanyName!=='') 
        foundSupplier.CompanyName = updateLegalSupplierDto.CompanyName;
    if (updateLegalSupplierDto.Email !== undefined && updateLegalSupplierDto.Email != null 
      && updateLegalSupplierDto.Email!=='') 
        foundSupplier.Email = updateLegalSupplierDto.Email;
    if (updateLegalSupplierDto.PhoneNumber !== undefined && updateLegalSupplierDto.PhoneNumber != null 
      && updateLegalSupplierDto.PhoneNumber!=='') 
        foundSupplier.PhoneNumber = updateLegalSupplierDto.PhoneNumber;
    if (updateLegalSupplierDto.Location !== undefined && updateLegalSupplierDto.Location != null 
      && updateLegalSupplierDto.Location!=='') 
        foundSupplier.Location = updateLegalSupplierDto.Location;  
    if (updateLegalSupplierDto.WebSite !== undefined && updateLegalSupplierDto.WebSite != null 
      &&updateLegalSupplierDto.WebSite!=='') 
        foundSupplier.WebSite = updateLegalSupplierDto.WebSite;  
    if (updateLegalSupplierDto.IsActive !== undefined && updateLegalSupplierDto.IsActive != null) 
        foundSupplier.IsActive = updateLegalSupplierDto.IsActive;

    return await this.legalSupplierRepo.save(foundSupplier);
  }

  async remove(Id: number) {
    const supplierFound = await this.findOne(Id)

    const hasProducts = await this.productSv.isOnLegalSupplier(Id);
    if (hasProducts) {
      throw new BadRequestException(
        `No se puede desactivar el proveedor ${Id} porque está asociado a al menos un producto.`
      );
    }
    supplierFound.IsActive = false;
    return await this.legalSupplierRepo.save(supplierFound);
  }
}
