import { Module } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { ProductDetail } from './entities/product-detail.entity';
import { ProductDetailController } from './product-detail.controller';
import { ProductModule } from '../product.module';
import { ProjectProjectionModule } from 'src/project-projection/project-projection.module';
import { ActualExpenseModule } from 'src/actual-expense/actual-expense.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductDetail]),
    ProductModule,
    ProjectProjectionModule, 
    ActualExpenseModule
  ],
  controllers: [ProductDetailController],
  providers: [ProductDetailService],
})
export class ProductDetailModule {}
