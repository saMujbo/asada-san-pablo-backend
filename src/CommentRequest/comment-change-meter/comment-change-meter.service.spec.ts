import { Test, TestingModule } from '@nestjs/testing';
import { CommentChangeMeterService } from './comment-change-meter.service';

describe('CommentChangeMeterService', () => {
  let service: CommentChangeMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentChangeMeterService],
    }).compile();

    service = module.get<CommentChangeMeterService>(CommentChangeMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
