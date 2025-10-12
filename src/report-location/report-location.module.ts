import { Module } from '@nestjs/common';
import { ReportLocationService } from './report-location.service';
import { ReportLocationController } from './report-location.controller';
import { ReportLocation } from './entities/report-location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportLocation])
  ],
  controllers: [ReportLocationController],
  providers: [ReportLocationService],
})
export class ReportLocationModule {}
