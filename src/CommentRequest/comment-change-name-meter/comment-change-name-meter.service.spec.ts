import { Test, TestingModule } from '@nestjs/testing';
import { CommentChangeNameMeterService } from './comment-change-name-meter.service';

describe('CommentChangeNameMeterService', () => {
  let service: CommentChangeNameMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentChangeNameMeterService],
    }).compile();

    service = module.get<CommentChangeNameMeterService>(CommentChangeNameMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
