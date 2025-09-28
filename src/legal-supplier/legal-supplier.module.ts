import { Module } from '@nestjs/common';
import { LegalSupplierService } from './legal-supplier.service';
import { LegalSupplierController } from './legal-supplier.controller';

@Module({
  controllers: [LegalSupplierController],
  providers: [LegalSupplierService],
})
export class LegalSupplierModule {}
