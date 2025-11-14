import { Test, TestingModule } from '@nestjs/testing';
import { CommentSupervisionMeterService } from './comment-supervision-meter.service';

describe('CommentSupervisionMeterService', () => {
  let service: CommentSupervisionMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentSupervisionMeterService],
    }).compile();

    service = module.get<CommentSupervisionMeterService>(CommentSupervisionMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
