import { forwardRef, Module } from '@nestjs/common';
import { RequesAvailabilityWaterService } from './reques-availability-water.service';
import { RequesAvailabilityWaterController } from './reques-availability-water.controller';
import { RequesAvailabilityWater } from './entities/reques-availability-water.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';
import { CommentAvailabilityWater } from 'src/CommentRequest/comment-availability-water/entities/comment-availability-water.entity';
import { NotificationModule } from 'src/notification/notification.module';


@Module({
  imports:[
    TypeOrmModule.forFeature([RequesAvailabilityWater]),
    forwardRef(()=> UsersModule),
    forwardRef(() => CommentAvailabilityWater),
    forwardRef(() => StateRequestModule),
    NotificationModule,
],
  controllers: [RequesAvailabilityWaterController],
  providers: [RequesAvailabilityWaterService],
  exports:[RequesAvailabilityWaterService]
})
export class RequesAvailabilityWaterModule {}
