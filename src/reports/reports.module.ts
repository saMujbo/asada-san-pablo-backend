import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MailServiceModule } from 'src/mail-service/mail-service.module';
import { ReportLocation } from 'src/report-location/entities/report-location.entity';
import { ReportType } from 'src/report-types/entities/report-type.entity';
import { ReportStateHistory } from './entities/report-state-history.entity';
import { DropboxModule } from 'src/dropbox/dropbox.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, ReportLocation, ReportType, ReportStateHistory]),
    MailServiceModule,
    DropboxModule,
    NotificationModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
