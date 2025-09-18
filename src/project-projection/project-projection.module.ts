import { Module } from '@nestjs/common';
import { ProjectProjectionService } from './project-projection.service';
import { ProjectProjectionController } from './project-projection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectProjection } from './entities/project-projection.entity';
import { Product } from 'src/product/entities/product.entity';
import { Project } from 'src/project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectProjection]),
  ],
  controllers: [ProjectProjectionController],
  providers: [ProjectProjectionService],
})
export class ProjectProjectionModule {}
