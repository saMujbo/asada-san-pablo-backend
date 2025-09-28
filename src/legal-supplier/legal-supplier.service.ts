import { Injectable } from '@nestjs/common';
import { CreateLegalSupplierDto } from './dto/create-legal-supplier.dto';
import { UpdateLegalSupplierDto } from './dto/update-legal-supplier.dto';

@Injectable()
export class LegalSupplierService {
  create(createLegalSupplierDto: CreateLegalSupplierDto) {
    return 'This action adds a new legalSupplier';
  }

  findAll() {
    return `This action returns all legalSupplier`;
  }

  findOne(id: number) {
    return `This action returns a #${id} legalSupplier`;
  }

  update(id: number, updateLegalSupplierDto: UpdateLegalSupplierDto) {
    return `This action updates a #${id} legalSupplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} legalSupplier`;
  }
}
