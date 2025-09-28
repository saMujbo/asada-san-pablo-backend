import { forwardRef, Module } from '@nestjs/common';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';
import { RequesAvailabilityWaterController } from './reques-availability-water.controller';
import { RequesAvailabilityWater } from './entities/reques-availability-water.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequesAvailabilityWater]),
    UsersModule,
    forwardRef(() => StateRequestModule)
],
  controllers: [RequesAvailabilityWaterController],
  providers: [RequesAvailabilityWaterService],
  exports:[RequesAvailabilityWaterService]
})
export class RequesAvailabilityWaterModule {}
