import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportStateHistory } from './entities/report-state-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportStateHistory])],
  exports: [TypeOrmModule],
})
export class ReportStateHistoryModule {}
