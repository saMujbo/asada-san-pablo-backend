import { forwardRef, Module } from '@nestjs/common';
import { PhysicalSupplierService } from './physical-supplier.service';
import { PhysicalSupplierController } from './physical-supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalSupplier } from './entities/physical-supplier.entity';
import { ProductModule } from 'src/product/product.module';
import { Supplier } from 'src/supplier/entities/supplier.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([PhysicalSupplier, Supplier]),
    forwardRef(() => ProductModule),
  ],
  controllers: [PhysicalSupplierController],
  providers: [PhysicalSupplierService],
  exports: [PhysicalSupplierService]
})
export class PhysicalSupplierModule {}
