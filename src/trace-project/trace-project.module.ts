import { Module } from '@nestjs/common';
import { TraceProjectService } from './trace-project.service';
import { TraceProjectController } from './trace-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceProject } from './entities/trace-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraceProject])
  ],
  controllers: [TraceProjectController],
  providers: [TraceProjectService],
})
export class TraceProjectModule {}
