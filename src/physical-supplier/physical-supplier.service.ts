import { Injectable } from '@nestjs/common';
import { CreatePhysicalSupplierDto } from './dto/create-physical-supplier.dto';
import { UpdatePhysicalSupplierDto } from './dto/update-physical-supplier.dto';

@Injectable()
export class PhysicalSupplierService {
  create(createPhysicalSupplierDto: CreatePhysicalSupplierDto) {
    return 'This action adds a new physicalSupplier';
  }

  findAll() {
    return `This action returns all physicalSupplier`;
  }

  findOne(id: number) {
    return `This action returns a #${id} physicalSupplier`;
  }

  update(id: number, updatePhysicalSupplierDto: UpdatePhysicalSupplierDto) {
    return `This action updates a #${id} physicalSupplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} physicalSupplier`;
  }
}
