import { Test, TestingModule } from '@nestjs/testing';
import { RequestsupervisionMeterController } from './requestsupervision-meter.controller';
import { RequestsupervisionMeterService } from './requestsupervision-meter.service';

describe('RequestsupervisionMeterController', () => {
  let controller: RequestsupervisionMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsupervisionMeterController],
      providers: [RequestsupervisionMeterService],
    }).compile();

    controller = module.get<RequestsupervisionMeterController>(RequestsupervisionMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
