import { forwardRef, Module } from '@nestjs/common';
import { CommentRequestService } from './comment-request.service';
import { CommentRequestController } from './comment-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRequest } from './entities/comment-request.entity';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';
import { RequestSupervisionMeter } from 'src/requestsupervision-meter/entities/requestsupervision-meter.entity';
import { RequestsupervisionMeterModule } from 'src/requestsupervision-meter/requestsupervision-meter.module';
import { RequestChangeMeterModule } from 'src/request-change-meter/request-change-meter.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentRequest]),
    forwardRef(() => RequesAvailabilityWaterModule),
    forwardRef(()=> RequestsupervisionMeterModule),
    forwardRef(()=> RequestChangeMeterModule)
  ],
  controllers: [CommentRequestController],
  providers: [CommentRequestService],
  exports: [CommentRequestService]
})
export class CommentRequestModule {}
