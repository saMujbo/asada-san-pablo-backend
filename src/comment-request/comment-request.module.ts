import { forwardRef, Module } from '@nestjs/common';
import { CommentRequestService } from './comment-request.service';
import { CommentRequestController } from './comment-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRequest } from './entities/comment-request.entity';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';
import { RequestSupervisionMeter } from 'src/requestsupervision-meter/entities/requestsupervision-meter.entity';
import { RequestsupervisionMeterModule } from 'src/requestsupervision-meter/requestsupervision-meter.module';
import { RequestChangeMeterModule } from 'src/request-change-meter/request-change-meter.module';
import { RequestChangeNameMeter } from 'src/request-change-name-meter/entities/request-change-name-meter.entity';
import { RequestChangeNameMeterModule } from 'src/request-change-name-meter/request-change-name-meter.module';
import { RequestAssociatedModule } from 'src/request-associated/request-associated.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentRequest]),
    forwardRef(() => RequesAvailabilityWaterModule),
    forwardRef(()=> RequestsupervisionMeterModule),
    forwardRef(()=> RequestChangeMeterModule),
    forwardRef(()=>RequestChangeNameMeterModule),
    forwardRef(()=>RequestAssociatedModule)
  ],
  controllers: [CommentRequestController],
  providers: [CommentRequestService],
  exports: [CommentRequestService]
})
export class CommentRequestModule {}
