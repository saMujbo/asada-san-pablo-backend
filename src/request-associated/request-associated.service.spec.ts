import { Test, TestingModule } from '@nestjs/testing';
import { RequestAssociatedService } from './request-associated.service';

describe('RequestAssociatedService', () => {
  let service: RequestAssociatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestAssociatedService],
    }).compile();

    service = module.get<RequestAssociatedService>(RequestAssociatedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
