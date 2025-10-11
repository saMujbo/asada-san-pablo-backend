import { forwardRef, Module } from '@nestjs/common';
import { RequestChangeNameMeterFileService } from './request-change-name-meter-file.service';
import { RequestChangeNameMeterFileController } from './request-change-name-meter-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestChangeNameMeterFile } from './entities/request-change-name-meter-file.entity';
import { RequestChangeNameMeterModule } from 'src/request-change-name-meter/request-change-name-meter.module';
import { DropboxModule } from 'src/dropbox/dropbox.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestChangeNameMeterFile]),
    forwardRef(()=>RequestChangeNameMeterModule),
    forwardRef(()=>DropboxModule)
    
  ],
  controllers: [RequestChangeNameMeterFileController],
  providers: [RequestChangeNameMeterFileService],
  exports:[RequestChangeNameMeterFileService]
})
export class RequestChangeNameMeterFileModule {}
