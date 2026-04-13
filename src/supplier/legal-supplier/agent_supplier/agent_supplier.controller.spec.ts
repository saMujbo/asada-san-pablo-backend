import { Test, TestingModule } from '@nestjs/testing';
import { AgentSupplierController } from './agent_supplier.controller';
import { AgentSupplierService } from './agent_supplier.service';

describe('AgentSupplierController', () => {
  let controller: AgentSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentSupplierController],
      providers: [AgentSupplierService],
    }).compile();

    controller = module.get<AgentSupplierController>(AgentSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
