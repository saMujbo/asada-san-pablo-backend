import { forwardRef, Module } from '@nestjs/common';
import { ProductDetailService } from './product-detail.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { ProductDetail } from './entities/product-detail.entity';
import { ProductDetailController } from './product-detail.controller';

@Module({
  imports: [
        TypeOrmModule.forFeature([ProductDetail]),
  ],
  controllers: [ProductDetailController],
  providers: [ProductDetailService],
})
export class ProductDetailModule {}
