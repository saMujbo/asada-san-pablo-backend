import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeNameMeterController } from './request-change-name-meter.controller';
import { RequestChangeNameMeterService } from './request-change-name-meter.service';

describe('RequestChangeNameMeterController', () => {
  let controller: RequestChangeNameMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestChangeNameMeterController],
      providers: [RequestChangeNameMeterService],
    }).compile();

    controller = module.get<RequestChangeNameMeterController>(RequestChangeNameMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
