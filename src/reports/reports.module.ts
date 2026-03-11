import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsGateway } from './reports.gateway';
import { MailServiceModule } from 'src/mail-service/mail-service.module';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportAssignmentsModule } from 'src/report-assignments/report-assignments.module';
import { ReportStateHistoryModule } from 'src/report-state-history/report-state-history.module';
import { ReportType } from 'src/report-types/entities/report-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, ReportLocation, ReportType]),
    MailServiceModule,
    ReportAssignmentsModule,
    ReportStateHistoryModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGateway],
  exports: [ReportsService],
})
export class ReportsModule {}
