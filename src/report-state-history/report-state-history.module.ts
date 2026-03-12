import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/reports/entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportAssignment } from 'src/report-assignments/entities/report-assignment.entity';
import { ReportStateHistory } from './entities/report-state-history.entity';
import { ReportStateHistoryService } from './report-state-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportStateHistory, Report, User, ReportAssignment])],
  providers: [ReportStateHistoryService],
  exports: [TypeOrmModule, ReportStateHistoryService],
})
export class ReportStateHistoryModule {}
