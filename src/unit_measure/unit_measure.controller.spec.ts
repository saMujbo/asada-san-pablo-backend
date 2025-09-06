import { Test, TestingModule } from '@nestjs/testing';
import { UnitMeasureController } from './unit_measure.controller';
import { UnitMeasureService } from './unit_measure.service';

describe('UnitMeasureController', () => {
  let controller: UnitMeasureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitMeasureController],
      providers: [UnitMeasureService],
    }).compile();

    controller = module.get<UnitMeasureController>(UnitMeasureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
