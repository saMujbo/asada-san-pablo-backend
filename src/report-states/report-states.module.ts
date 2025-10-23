import { forwardRef, Module } from '@nestjs/common';
import { ReportStatesService } from './report-states.service';
import { ReportStatesController } from './report-states.controller';
import { ReportState } from './entities/report-state.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportState]),
    forwardRef(() => ReportsModule), 
  ],
  controllers: [ReportStatesController],
  providers: [ReportStatesService],
  exports: [TypeOrmModule, ReportStatesService],
})
export class ReportStatesModule {}
