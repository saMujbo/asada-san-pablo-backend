import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeNameMeterService } from './request-change-name-meter.service';

describe('RequestChangeNameMeterService', () => {
  let service: RequestChangeNameMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestChangeNameMeterService],
    }).compile();

    service = module.get<RequestChangeNameMeterService>(RequestChangeNameMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
