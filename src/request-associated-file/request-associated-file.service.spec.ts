import { Test, TestingModule } from '@nestjs/testing';
import { RequestAssociatedFileService } from './request-associated-file.service';

describe('RequestAssociatedFileService', () => {
  let service: RequestAssociatedFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestAssociatedFileService],
    }).compile();

    service = module.get<RequestAssociatedFileService>(RequestAssociatedFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
