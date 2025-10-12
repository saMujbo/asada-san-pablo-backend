import { Test, TestingModule } from '@nestjs/testing';
import { ReportLocationService } from './report-location.service';

describe('ReportLocationService', () => {
  let service: ReportLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportLocationService],
    }).compile();

    service = module.get<ReportLocationService>(ReportLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
