import { forwardRef, Module } from '@nestjs/common';
import { RequestChangeMeterService } from './request-change-meter.service';
import { RequestChangeMeterController } from './request-change-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestChangeMeter } from './entities/request-change-meter.entity';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';


@Module({
  imports:[
    TypeOrmModule.forFeature([RequestChangeMeter]),
    forwardRef(()=> UsersModule),
    forwardRef(() => StateRequestModule)
  ],
  controllers: [RequestChangeMeterController],
  providers: [RequestChangeMeterService],
  exports:[RequestChangeMeterService]
})
export class RequestChangeMeterModule {}
