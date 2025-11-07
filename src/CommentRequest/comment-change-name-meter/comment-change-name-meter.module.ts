import { forwardRef, Module } from '@nestjs/common';
import { CommentChangeNameMeterService } from './comment-change-name-meter.service';
import { CommentChangeNameMeterController } from './comment-change-name-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentChangeNameMeter } from './entities/comment-change-name-meter.entity';
import { RequestChangeNameMeterFileModule } from 'src/request-change-name-meter-file/request-change-name-meter-file.module';
import { RequestChangeNameMeterModule } from 'src/request-change-name-meter/request-change-name-meter.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentChangeNameMeter]),
          forwardRef(() => RequestChangeNameMeterModule),
          forwardRef(() => RequestChangeNameMeterFileModule)
  ],
  controllers: [CommentChangeNameMeterController],
  providers: [CommentChangeNameMeterService],
  exports:[CommentChangeNameMeterService]
})
export class CommentChangeNameMeterModule {}
