import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/reports/entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportStateHistoryModule } from 'src/report-state-history/report-state-history.module';
import { ReportAssignment } from './entities/report-assignment.entity';
import { ReportAssignmentsService } from './report-assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportAssignment, Report, User]),
    ReportStateHistoryModule,
  ],
  providers: [ReportAssignmentsService],
  exports: [TypeOrmModule, ReportAssignmentsService],
})
export class ReportAssignmentsModule {}
