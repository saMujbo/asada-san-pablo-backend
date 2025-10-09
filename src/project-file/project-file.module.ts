import { Module } from '@nestjs/common';
import { ProjectFileService } from './project-file.service';
import { ProjectFileController } from './project-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectFile } from './entities/project-file.entity';
import { ProjectModule } from 'src/project/project.module';
import { DropboxModule } from 'src/dropbox/dropbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectFile]),
    ProjectModule,
    DropboxModule
  ],
  controllers: [ProjectFileController],
  providers: [ProjectFileService],
})
export class ProjectFileModule {}
