import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProductModule } from 'src/product/product.module';
import { ProjectStateModule } from './project-state/project-state.module';
import { Product } from 'src/product/entities/product.entity';
import { ProjectProduct } from './project_product/entities/project_product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectProduct]),
    forwardRef(() => ProjectStateModule),
    ProductModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
