import { Test, TestingModule } from '@nestjs/testing';
import { RequestAvailabilityWaterFileService } from './request-availability-water-file.service';

describe('RequestAvailabilityWaterFileService', () => {
  let service: RequestAvailabilityWaterFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestAvailabilityWaterFileService],
    }).compile();

    service = module.get<RequestAvailabilityWaterFileService>(RequestAvailabilityWaterFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
