import { Test, TestingModule } from '@nestjs/testing';
import { LegalSupplierController } from './legal-supplier.controller';
import { LegalSupplierService } from './legal-supplier.service';

describe('LegalSupplierController', () => {
  let controller: LegalSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalSupplierController],
      providers: [LegalSupplierService],
    }).compile();

    controller = module.get<LegalSupplierController>(LegalSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
