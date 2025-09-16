import { forwardRef, Module } from '@nestjs/common';
import { ProjectStateService } from './project-state.service';
import { ProjectStateController } from './project-state.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectState } from './entities/project-state.entity';
import { ProductModule } from 'src/product/product.module';
import { ProjectModule } from '../project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectState]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [ProjectStateController],
  providers: [ProjectStateService],
  exports: [ProjectStateService],
})
export class ProjectStateModule {}
