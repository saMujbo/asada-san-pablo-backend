import { Test, TestingModule } from '@nestjs/testing';
import { TotalActualExpenseService } from './total-actual-expense.service';

describe('TotalActualExpenseService', () => {
  let service: TotalActualExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TotalActualExpenseService],
    }).compile();

    service = module.get<TotalActualExpenseService>(TotalActualExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
