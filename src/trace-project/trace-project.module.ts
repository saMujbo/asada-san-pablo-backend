import { Module } from '@nestjs/common';
import { TraceProjectService } from './trace-project.service';
import { TraceProjectController } from './trace-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceProject } from './entities/trace-project.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraceProject]),
    ProjectModule
  ],
  controllers: [TraceProjectController],
  providers: [TraceProjectService],
  exports: [TraceProjectService]
})
export class TraceProjectModule {}
