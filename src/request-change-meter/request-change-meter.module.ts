import { forwardRef, Module } from '@nestjs/common';
import { RequestChangeMeterService } from './request-change-meter.service';
import { RequestChangeMeterController } from './request-change-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestChangeMeter } from './entities/request-change-meter.entity';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';
import { CommentChangeMeter } from 'src/CommentRequest/comment-change-meter/entities/comment-change-meter.entity';
import { CommentChangeMeterModule } from 'src/CommentRequest/comment-change-meter/comment-change-meter.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestChangeMeter]),
    forwardRef(()=> UsersModule),
    forwardRef(() => StateRequestModule),
    forwardRef(() => CommentChangeMeterModule),
  ],
  controllers: [RequestChangeMeterController],
  providers: [RequestChangeMeterService],
  exports:[RequestChangeMeterService]
})
export class RequestChangeMeterModule {}
