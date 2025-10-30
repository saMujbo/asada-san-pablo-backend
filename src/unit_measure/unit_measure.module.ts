import { forwardRef, Module } from '@nestjs/common';
import { UnitMeasureService } from './unit_measure.service';
import { UnitMeasureController } from './unit_measure.controller';
import { UnitMeasure } from './entities/unit_measure.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([UnitMeasure]),
    forwardRef(() => ProductModule),
  ],
  controllers: [UnitMeasureController],
  providers: [UnitMeasureService],
  exports: [UnitMeasureService],
})
export class UnitMeasureModule {}
