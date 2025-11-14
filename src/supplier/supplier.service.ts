import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  create(createSupplierDto: CreateSupplierDto) {
    return 'This action adds a new supplier';
  }

  async findAll() {
    return this.supplierRepository.find();
  }

  async findAllByIds(IDsArray: number[]) {
    const suppliers = await this.supplierRepository.find({
      where: { Id: In(IDsArray) },
    });
    
    if (suppliers.length !== IDsArray.length) {
      const foundIds = new Set(suppliers.map(s => s.Id));
      const missingIds = IDsArray.filter(id => !foundIds.has(id));
      throw new NotFoundException(`Proveedores no encontrados: [${missingIds.join(', ')}]`);
    }
    
    return suppliers;
  }

  findOne(id: number) {
    return `This action returns a #${id} supplier`;
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }
}
