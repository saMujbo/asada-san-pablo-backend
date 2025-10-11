import { Test, TestingModule } from '@nestjs/testing';
import { StateRequestService } from './state-request.service';

describe('StateRequestService', () => {
  let service: StateRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateRequestService],
    }).compile();

    service = module.get<StateRequestService>(StateRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
