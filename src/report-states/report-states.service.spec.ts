import { Test, TestingModule } from '@nestjs/testing';
import { ReportStatesService } from './report-states.service';

describe('ReportStatesService', () => {
  let service: ReportStatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportStatesService],
    }).compile();

    service = module.get<ReportStatesService>(ReportStatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
