import { Test, TestingModule } from '@nestjs/testing';
import { ActualExpenseService } from './actual-expense.service';

describe('ActualExpenseService', () => {
  let service: ActualExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActualExpenseService],
    }).compile();

    service = module.get<ActualExpenseService>(ActualExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
