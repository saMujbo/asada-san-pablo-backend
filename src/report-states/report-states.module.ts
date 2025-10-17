import { Module } from '@nestjs/common';
import { ReportStatesService } from './report-states.service';
import { ReportStatesController } from './report-states.controller';
import { ReportState } from './entities/report-state.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportState]),
  ],
  controllers: [ReportStatesController],
  providers: [ReportStatesService],
})
export class ReportStatesModule {}
