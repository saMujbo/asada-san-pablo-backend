import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { MaterialModule } from 'src/material/material.module';
import { UnitMeasureModule } from 'src/unit_measure/unit_measure.module';

@Module({
  imports:[
      TypeOrmModule.forFeature([Product]),
      CategoriesModule,
      MaterialModule,
      UnitMeasureModule
    ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
