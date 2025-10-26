import { Test, TestingModule } from '@nestjs/testing';
import { TotalActualExpenseController } from './total-actual-expense.controller';
import { TotalActualExpenseService } from './total-actual-expense.service';

describe('TotalActualExpenseController', () => {
  let controller: TotalActualExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TotalActualExpenseController],
      providers: [TotalActualExpenseService],
    }).compile();

    controller = module.get<TotalActualExpenseController>(TotalActualExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
