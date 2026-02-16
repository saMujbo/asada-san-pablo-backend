import { Test, TestingModule } from '@nestjs/testing';
import { PhysicalSupplierService } from './physical-supplier.service';

describe('PhysicalSupplierService', () => {
  let service: PhysicalSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhysicalSupplierService],
    }).compile();

    service = module.get<PhysicalSupplierService>(PhysicalSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
