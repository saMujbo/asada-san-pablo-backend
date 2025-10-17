import { Test, TestingModule } from '@nestjs/testing';
import { ReportTypesService } from './report-types.service';

describe('ReportTypesService', () => {
  let service: ReportTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportTypesService],
    }).compile();

    service = module.get<ReportTypesService>(ReportTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
