import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProductModule } from 'src/product/product.module';
import { ProjectStateModule } from './project-state/project-state.module';
import { UsersModule } from 'src/users/users.module';
import { TotalActualExpenseModule } from 'src/total-actual-expense/total-actual-expense.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => ProjectStateModule),
    forwardRef(() => TotalActualExpenseModule),
    ProductModule,
    UsersModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
