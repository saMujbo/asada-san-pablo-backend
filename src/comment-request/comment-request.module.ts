import { Module } from '@nestjs/common';
import { CommentRequestService } from './comment-request.service';
import { CommentRequestController } from './comment-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRequest } from './entities/comment-request.entity';
import { RequesAvailabilityWaterModule } from 'src/reques-availability-water/reques-availability-water.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentRequest]),
    RequesAvailabilityWaterModule,
  ],
  controllers: [CommentRequestController],
  providers: [CommentRequestService],
})
export class CommentRequestModule {}
