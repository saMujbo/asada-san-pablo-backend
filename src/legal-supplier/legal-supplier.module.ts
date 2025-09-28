import { forwardRef, Module } from '@nestjs/common';
import { LegalSupplierService } from './legal-supplier.service';
import { LegalSupplierController } from './legal-supplier.controller';
import { LegalSupplier } from './entities/legal-supplier.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([LegalSupplier]),
    forwardRef(() => ProductModule),
  ],
  controllers: [LegalSupplierController],
  providers: [LegalSupplierService],
  exports: [LegalSupplierService]
})
export class LegalSupplierModule {}
