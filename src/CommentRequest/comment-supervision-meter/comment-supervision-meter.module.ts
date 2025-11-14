import { forwardRef, Module } from '@nestjs/common';
import { CommentSupervisionMeterService } from './comment-supervision-meter.service';
import { CommentSupervisionMeterController } from './comment-supervision-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentSupervisionMeter } from './entities/comment-supervision-meter.entity';
import { RequestsupervisionMeterModule } from 'src/requestsupervision-meter/requestsupervision-meter.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
  TypeOrmModule.forFeature([CommentSupervisionMeter]),
  forwardRef(() => RequestsupervisionMeterModule),
  forwardRef(() => UsersModule),
  ],
  controllers: [CommentSupervisionMeterController],
  providers: [CommentSupervisionMeterService],
  exports:[CommentSupervisionMeterService]
})
export class CommentSupervisionMeterModule {}
