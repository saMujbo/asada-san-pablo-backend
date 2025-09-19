import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProductModule } from 'src/product/product.module';
import { ProjectStateModule } from './project-state/project-state.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => ProjectStateModule),
    ProductModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
