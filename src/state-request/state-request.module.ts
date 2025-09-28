import { forwardRef, Module } from '@nestjs/common';
import { StateRequestService } from './state-request.service';
import { StateRequestController } from './state-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';
import { StateRequest } from './entities/state-request.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([StateRequest]),
    forwardRef(() => RequesAvailabilityWaterModule),

],
  controllers: [StateRequestController],
  providers: [StateRequestService],
  exports: [StateRequestService]
})

export class StateRequestModule {}
