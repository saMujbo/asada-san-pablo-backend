import { forwardRef, Module } from '@nestjs/common';
import { LegalSupplierService } from './legal-supplier.service';
import { LegalSupplierController } from './legal-supplier.controller';
import { LegalSupplier } from './entities/legal-supplier.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { Supplier } from 'src/supplier/entities/supplier.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([LegalSupplier, Supplier]),
    forwardRef(() => ProductModule),
  ],
  controllers: [LegalSupplierController],
  providers: [LegalSupplierService],
  exports: [LegalSupplierService]
})
export class LegalSupplierModule {}
