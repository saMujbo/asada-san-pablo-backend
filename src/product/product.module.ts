import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductSupplier } from './entities/product-supplier.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { MaterialModule } from 'src/material/material.module';
import { UnitMeasureModule } from 'src/unit_measure/unit_measure.module';
import { LegalSupplierModule } from 'src/legal-supplier/legal-supplier.module';
import { PhysicalSupplierModule } from 'src/physical-supplier/physical-supplier.module';
import { SupplierModule } from 'src/supplier/supplier.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Product, ProductSupplier]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => MaterialModule),
    forwardRef(() => UnitMeasureModule),
    forwardRef(() => LegalSupplierModule),
    forwardRef(() => PhysicalSupplierModule),
    forwardRef(() => SupplierModule),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
