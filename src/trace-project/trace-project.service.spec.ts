import { Test, TestingModule } from '@nestjs/testing';
import { TraceProjectService } from './trace-project.service';

describe('TraceProjectService', () => {
  let service: TraceProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraceProjectService],
    }).compile();

    service = module.get<TraceProjectService>(TraceProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
