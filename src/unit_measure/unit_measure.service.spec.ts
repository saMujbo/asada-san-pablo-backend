import { Test, TestingModule } from '@nestjs/testing';
import { UnitMeasureService } from './unit_measure.service';

describe('UnitMeasureService', () => {
  let service: UnitMeasureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitMeasureService],
    }).compile();

    service = module.get<UnitMeasureService>(UnitMeasureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
