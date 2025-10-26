import { Module } from '@nestjs/common';
import { TotalActualExpenseService } from './total-actual-expense.service';
import { TotalActualExpenseController } from './total-actual-expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from 'src/project/project.module';
import { TotalActualExpense } from './entities/total-actual-expense.entity';
import { ActualExpenseModule } from 'src/actual-expense/actual-expense.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TotalActualExpense]),
    ProjectModule,
    ActualExpenseModule
  ],
  controllers: [TotalActualExpenseController],
  providers: [TotalActualExpenseService],
  exports: [TotalActualExpenseService],
})
export class TotalActualExpenseModule {}
