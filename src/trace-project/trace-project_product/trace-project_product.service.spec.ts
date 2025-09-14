import { Test, TestingModule } from '@nestjs/testing';
import { TraceProjectProductService } from './trace-project_product.service';

describe('TraceProjectProductService', () => {
  let service: TraceProjectProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraceProjectProductService],
    }).compile();

    service = module.get<TraceProjectProductService>(TraceProjectProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
