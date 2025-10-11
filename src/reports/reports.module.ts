import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from 'src/users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsGateway } from './reports.gateway';
import { MailServiceModule } from 'src/mail-service/mail-service.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User]), MailServiceModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGateway],
})
export class ReportsModule {}
