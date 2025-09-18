import { Test, TestingModule } from '@nestjs/testing';
import { AgentSupplierService } from './agent_supplier.service';

describe('AgentSupplierService', () => {
  let service: AgentSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentSupplierService],
    }).compile();

    service = module.get<AgentSupplierService>(AgentSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
