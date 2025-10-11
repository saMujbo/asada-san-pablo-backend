import { forwardRef, Module } from '@nestjs/common';
import { RequestChangeNameMeterService } from './request-change-name-meter.service';
import { RequestChangeNameMeterController } from './request-change-name-meter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestChangeNameMeter } from './entities/request-change-name-meter.entity';
import { UsersModule } from 'src/users/users.module';
import { StateRequestModule } from 'src/state-request/state-request.module';
import { RequestChangeNameMeterFileModule } from 'src/request-change-name-meter-file/request-change-name-meter-file.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestChangeNameMeter]),
        forwardRef(()=> UsersModule),
        forwardRef(() => StateRequestModule),
        forwardRef(()=>RequestChangeNameMeterFileModule)
  ],
  controllers: [RequestChangeNameMeterController],
  providers: [RequestChangeNameMeterService],
  exports:[RequestChangeNameMeterService]
})
export class RequestChangeNameMeterModule {}
