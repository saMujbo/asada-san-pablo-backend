import { Test, TestingModule } from '@nestjs/testing';
import { LegalSupplierService } from './legal-supplier.service';

describe('LegalSupplierService', () => {
  let service: LegalSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalSupplierService],
    }).compile();

    service = module.get<LegalSupplierService>(LegalSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
