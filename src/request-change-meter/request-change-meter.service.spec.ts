import { Test, TestingModule } from '@nestjs/testing';
import { RequestChangeMeterService } from './request-change-meter.service';

describe('RequestChangeMeterService', () => {
  let service: RequestChangeMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestChangeMeterService],
    }).compile();

    service = module.get<RequestChangeMeterService>(RequestChangeMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
