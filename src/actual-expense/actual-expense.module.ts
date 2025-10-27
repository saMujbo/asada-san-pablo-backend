// actual-expense.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { ActualExpenseService } from './actual-expense.service';
import { ActualExpenseController } from './actual-expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActualExpense } from './entities/actual-expense.entity';
import { TraceProjectModule } from 'src/trace-project/trace-project.module';
import { TotalActualExpenseModule } from 'src/total-actual-expense/total-actual-expense.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActualExpense]),
    forwardRef(() => TraceProjectModule),    
  ],
  controllers: [ActualExpenseController],
  providers: [ActualExpenseService],
  exports: [ActualExpenseService],
})
export class ActualExpenseModule {}
