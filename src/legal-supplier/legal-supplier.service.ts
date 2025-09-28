import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LegalSupplier } from './entities/legal-supplier.entity';
import { Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';

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
