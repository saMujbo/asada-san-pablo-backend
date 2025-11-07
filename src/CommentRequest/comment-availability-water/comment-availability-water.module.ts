import { forwardRef, Module } from '@nestjs/common';
import { CommentAvailabilityWaterService } from './comment-availability-water.service';
import { CommentAvailabilityWaterController } from './comment-availability-water.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentAvailabilityWater } from './entities/comment-availability-water.entity';
import { RequestAvailabilityWaterFileModule } from 'src/request-availability-water-file/request-availability-water-file.module';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';

@Module({
    imports:[
      TypeOrmModule.forFeature([CommentAvailabilityWater]),
    forwardRef(() => RequesAvailabilityWaterModule),
    forwardRef(() => RequestAvailabilityWaterFileModule),
  ],
  controllers: [CommentAvailabilityWaterController],
  providers: [CommentAvailabilityWaterService],
  exports:[CommentAvailabilityWaterService]
})
export class CommentAvailabilityWaterModule {}
