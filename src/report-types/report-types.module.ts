import { Module } from '@nestjs/common';
import { ReportTypesService } from './report-types.service';
import { ReportTypesController } from './report-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportType } from './entities/report-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportType])
  ],
  controllers: [ReportTypesController],
  providers: [ReportTypesService],
})
export class ReportTypesModule {}
