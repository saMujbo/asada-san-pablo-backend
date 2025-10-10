import { Module } from '@nestjs/common';
import { RequestAvailabilityWaterFileService } from './request-availability-water-file.service';
import { RequestAvailabilityWaterFileController } from './request-availability-water-file.controller';
import { RequestAvailabilityWaterFile } from './entities/request-availability-water-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';
import { DropboxModule } from 'src/dropbox/dropbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestAvailabilityWaterFile]),
    RequesAvailabilityWaterModule,
    DropboxModule
  ],
  controllers: [RequestAvailabilityWaterFileController],
  providers: [RequestAvailabilityWaterFileService],
})
export class RequestAvailabilityWaterFileModule {}
