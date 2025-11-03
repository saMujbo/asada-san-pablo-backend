import { forwardRef, Module } from '@nestjs/common';
import { RequestAssociatedFileService } from './request-associated-file.service';
import { RequestAssociatedFileController } from './request-associated-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestAssociatedFile } from './entities/request-associated-file.entity';
import { RequestAssociatedModule } from 'src/request-associated/request-associated.module';
import { DropboxModule } from 'src/dropbox/dropbox.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([RequestAssociatedFile]),
    forwardRef(()=>RequestAssociatedModule),
    forwardRef(()=>DropboxModule)
    
  ],
  controllers: [RequestAssociatedFileController],
  providers: [RequestAssociatedFileService],
  exports:[RequestAssociatedFileModule]
})
export class RequestAssociatedFileModule {}
