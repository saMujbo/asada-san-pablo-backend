import { forwardRef, Module } from '@nestjs/common';
import { CommentChangeMeterService } from './comment-change-meter.service';
import { CommentChangeMeterController } from './comment-change-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentChangeMeter } from './entities/comment-change-meter.entity';
import { RequestChangeMeterModule } from 'src/request-change-meter/request-change-meter.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentChangeMeter]),
    forwardRef(() => RequestChangeMeterModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CommentChangeMeterController],
  providers: [CommentChangeMeterService],
  exports:[CommentChangeMeterService]
})
export class CommentChangeMeterModule {}
