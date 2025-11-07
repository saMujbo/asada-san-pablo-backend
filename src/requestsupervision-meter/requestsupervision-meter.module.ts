import { forwardRef, Module } from '@nestjs/common';
import { RequestsupervisionMeterService } from './requestsupervision-meter.service';
import { RequestsupervisionMeterController } from './requestsupervision-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestSupervisionMeter } from './entities/requestsupervision-meter.entity';
import { StateRequestModule } from 'src/state-request/state-request.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestSupervisionMeter]),
    forwardRef(() => StateRequestModule),
    forwardRef(()=>UsersModule)
  ],
  controllers: [RequestsupervisionMeterController],
  providers: [RequestsupervisionMeterService],
  exports:[RequestsupervisionMeterService]
})
export class RequestsupervisionMeterModule {}
