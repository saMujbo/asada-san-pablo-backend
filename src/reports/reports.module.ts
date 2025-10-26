import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsGateway } from './reports.gateway';
import { MailServiceModule } from 'src/mail-service/mail-service.module';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { ReportState } from 'src/report-states/entities/report-state.entity';
import { ReportStatesModule } from 'src/report-states/report-states.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, ReportLocation, ReportType, ReportState]), forwardRef(() => ReportStatesModule),MailServiceModule,],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGateway],
  exports: [ReportsService],
})
export class ReportsModule {}
