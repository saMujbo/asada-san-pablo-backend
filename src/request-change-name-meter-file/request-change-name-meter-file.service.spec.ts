import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeNameMeterFileService } from './request-change-name-meter-file.service';

describe('RequestChangeNameMeterFileService', () => {
  let service: RequestChangeNameMeterFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestChangeNameMeterFileService],
    }).compile();

    service = module.get<RequestChangeNameMeterFileService>(RequestChangeNameMeterFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
