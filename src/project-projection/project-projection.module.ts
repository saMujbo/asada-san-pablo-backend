import { Module } from '@nestjs/common';
import { ProjectProjectionService } from './project-projection.service';
import { ProjectProjectionController } from './project-projection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectProjection } from './entities/project-projection.entity';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectProjection]),
    ProjectModule
  ],
  controllers: [ProjectProjectionController],
  providers: [ProjectProjectionService],
  exports: [ProjectProjectionService],
})
export class ProjectProjectionModule {}
