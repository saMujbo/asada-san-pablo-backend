import { Test, TestingModule } from '@nestjs/testing';
import { ActualExpenseController } from './actual-expense.controller';
import { ActualExpenseService } from './actual-expense.service';

describe('ActualExpenseController', () => {
  let controller: ActualExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActualExpenseController],
      providers: [ActualExpenseService],
    }).compile();

    controller = module.get<ActualExpenseController>(ActualExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
