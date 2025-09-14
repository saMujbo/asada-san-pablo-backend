import { Module } from '@nestjs/common';
import { ProjectStateService } from './project-state.service';
import { ProjectStateController } from './project-state.controller';

@Module({
  controllers: [ProjectStateController],
  providers: [ProjectStateService],
})
export class ProjectStateModule {}
