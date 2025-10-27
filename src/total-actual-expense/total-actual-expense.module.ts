// total-actual-expense.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TotalActualExpenseService } from './total-actual-expense.service';
import { TotalActualExpenseController } from './total-actual-expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from 'src/project/project.module';
import { TotalActualExpense } from './entities/total-actual-expense.entity';
import { ActualExpenseModule } from 'src/actual-expense/actual-expense.module';
import { ProductDetail } from 'src/product/product-detail/entities/product-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TotalActualExpense, ProductDetail]),
    forwardRef(() => ProjectModule),
    forwardRef(() => ActualExpenseModule), // 👈 agregado
  ],
  controllers: [TotalActualExpenseController],
  providers: [TotalActualExpenseService],
  exports: [TotalActualExpenseService],
})
export class TotalActualExpenseModule {}
