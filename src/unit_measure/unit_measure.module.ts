import { Module } from '@nestjs/common';
import { UnitMeasureService } from './unit_measure.service';
import { UnitMeasureController } from './unit_measure.controller';
import { UnitMeasure } from './entities/unit_measure.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[
      TypeOrmModule.forFeature([UnitMeasure]),
    ],
  controllers: [UnitMeasureController],
  providers: [UnitMeasureService],
})
export class UnitMeasureModule {}
