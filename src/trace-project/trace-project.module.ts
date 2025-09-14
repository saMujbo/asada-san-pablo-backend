import { Module } from '@nestjs/common';
import { TraceProjectService } from './trace-project.service';
import { TraceProjectController } from './trace-project.controller';

@Module({
  controllers: [TraceProjectController],
  providers: [TraceProjectService],
})
export class TraceProjectModule {}
