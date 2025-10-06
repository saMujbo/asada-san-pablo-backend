import { Test, TestingModule } from '@nestjs/testing';
import { RequestsupervisionMeterService } from './requestsupervision-meter.service';

describe('RequestsupervisionMeterService', () => {
  let service: RequestsupervisionMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestsupervisionMeterService],
    }).compile();

    service = module.get<RequestsupervisionMeterService>(RequestsupervisionMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
