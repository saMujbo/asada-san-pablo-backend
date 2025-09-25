import { Module } from '@nestjs/common';
import { ActualExpenseService } from './actual-expense.service';
import { ActualExpenseController } from './actual-expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActualExpense } from './entities/actual-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActualExpense])
  ],
  controllers: [ActualExpenseController],
  providers: [ActualExpenseService],
  exports: [ActualExpenseService]
})
export class ActualExpenseModule {}
