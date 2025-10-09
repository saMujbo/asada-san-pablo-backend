import { Test, TestingModule } from '@nestjs/testing';
import { PhysicalSupplierController } from './physical-supplier.controller';
import { PhysicalSupplierService } from './physical-supplier.service';

describe('PhysicalSupplierController', () => {
  let controller: PhysicalSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhysicalSupplierController],
      providers: [PhysicalSupplierService],
    }).compile();

    controller = module.get<PhysicalSupplierController>(PhysicalSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
