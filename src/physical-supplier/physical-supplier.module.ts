import { Module } from '@nestjs/common';
import { PhysicalSupplierService } from './physical-supplier.service';
import { PhysicalSupplierController } from './physical-supplier.controller';

@Module({
  controllers: [PhysicalSupplierController],
  providers: [PhysicalSupplierService],
})
export class PhysicalSupplierModule {}
