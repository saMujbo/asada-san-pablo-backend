import { forwardRef, Module } from '@nestjs/common';
import { StateRequestService } from './state-request.service';
import { StateRequestController } from './state-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';
import { StateRequest } from './entities/state-request.entity';
import { RequestsupervisionMeterModule } from 'src/requestsupervision-meter/requestsupervision-meter.module';
import { RequestChangeMeterModule } from 'src/request-change-meter/request-change-meter.module';


@Module({
  imports:[
    TypeOrmModule.forFeature([StateRequest]),
    forwardRef(() => RequesAvailabilityWaterModule),
    forwardRef(() => RequestsupervisionMeterModule),
    forwardRef(() => RequestChangeMeterModule),

],
  controllers: [StateRequestController],
  providers: [StateRequestService],
  exports: [StateRequestService]
})

export class StateRequestModule {}
